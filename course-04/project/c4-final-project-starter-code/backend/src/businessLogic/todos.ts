import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from "../fileStorage/attachmentUtils";
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
//import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'
// import { parseUserId } from '../auth/utils';
import { TodoUpdate } from '../models/TodoUpdate';

// TODO: Implement businessLogic
const todoAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    // const userId = parseUserId(jwtToken)
    return todoAccess.getAllTodos(userId)
}

export async function createTodo(CreateTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {

    const todoId = uuid.v4()
    // const userId = parseUserId(jwtToken)
    const userId = jwtToken
    const attachmentBucketName = process.env.ATTACHMENT_S3_BUCKET

    return await todoAccess.createTodo({
        todoId: todoId,
        userId: userId,
        createdAt: new Date().toISOString(),
        name: CreateTodoRequest.name,
        attachmentUrl:  `https://${attachmentBucketName}.s3.amazonaws.com/${todoId}`, 
        dueDate: CreateTodoRequest.dueDate,
        done: false
    })
}

export async function deleteTodo(userId:string, todoId:string): Promise<string> {

    // const userId = parseUserId(jwtToken)
    return todoAccess.deleteTodo(userId, todoId)

}

export async function updateTodo(UpdateTodoRequest: UpdateTodoRequest, todoId: string, userId: string): Promise<TodoUpdate> {

    // const userId = parseUserId(jwtToken)
    return todoAccess.updateTodo(UpdateTodoRequest, todoId, userId)
}

export async function generateUploadUrl(todoId: string): Promise<string> {

    return attachmentUtils.generateUploadUrl(todoId)
}