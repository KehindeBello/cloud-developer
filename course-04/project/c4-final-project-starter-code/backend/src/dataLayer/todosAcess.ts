import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
const AWSXRay = require("aws-xray-sdk")
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
// import { TextDecoder } from 'util'
//import { getUserId } from '../lambda/utils'
import { Types } from 'aws-sdk/clients/s3'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    
    constructor(
        private readonly docClient : DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly s3Client: Types = new AWS.S3({signatureVersion: 'v4'}),
        private readonly s3Bucket = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ){}

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
        
        logger.info('Todo Created')
        return todo
    }

    async getAllTodos(userId:string): Promise<TodoItem[]> {
        console.log('Getting all Todos')

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {"#userId" : "userId"}, 
            ExpressionAttributeValues: {":userId" : userId }
        }).promise()

        const todos = result.Items 
        return todos as TodoItem[] 
    }
    
    async updateTodo(TodoUpdate: TodoUpdate, todoId:String, userId:String): Promise<TodoUpdate> {
        const updatedTodo = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "SET #done = :done, #name= :name, #dueDate = :dueDate",
            ExpressionAttributeNames: {
                "#name": "name",
                "#dueDate": "dueDate",
                "#done": "done"
            },
            ExpressionAttributeValues: {
                ":done": TodoUpdate['done'],
                ":name": TodoUpdate['name'],
                ":dueDate": TodoUpdate['dueDate']
            },
            ReturnValues: "ALL_NEW"
            
        }).promise()

        logger.info('Todo Updated', {
            todoid: todoId,
            userid: userId  
        })
        return updatedTodo.Attributes as TodoUpdate
    }

    async deleteTodo(userId: String, todoId: String): Promise<string>{

        const result = await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "userId": userId
                
            }
        }).promise()
        console.log(`UserId ${userId}`)
        console.log(`todoId ${todoId}`)
        console.log(result)

        logger.info('Todo Deleted',{
            id: todoId,
            response: result
        })
        return "Item Deleted" 
    }

    async generateUploadUrl(todoId:string): Promise<string> {

        const uploadUrl = this.s3Client.getSignedUrl('putObject',{
            Bucket: this.s3Bucket,
            Key: todoId,
            Expires: Number(this.urlExpiration)
        })
        
        return uploadUrl
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE){
        console.log('Creating a local dynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}
