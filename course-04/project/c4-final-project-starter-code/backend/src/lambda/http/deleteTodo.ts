import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
// import * as middy from 'middy'
// import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger("DeleteTodo")


export const handler =
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    const userId = getUserId(event)
    
    const data = await deleteTodo(userId, todoId)
    logger.info("Todo Item Deleted")
    
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: data
    }
  }

// handler
//   .use(httpErrorHandler())
//   .use(
//     cors({
//       credentials: true,
//       origin: "*"
//     })
//   )
