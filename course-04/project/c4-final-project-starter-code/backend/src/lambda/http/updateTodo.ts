import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'
const logger = createLogger("UpdateTodo")


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    const jwtToken = getUserId(event)
    const todoUpdate = await updateTodo(updatedTodo, todoId, jwtToken)

    logger.info(`Todo with id ${todoId} updated`)

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin":"*",
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        "todo" : todoUpdate
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
      origin: "*"
    })
  )
