import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getUserId } from '../utils';
import { getAllTodos } from '../../helpers/todos'

import { createLogger } from '../../utils/logger'
const logger = createLogger("GetTodo")


// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userId = getUserId(event)
    const todos = await getAllTodos(userId)

    logger.info(`Fetched todo for user ${userId}`)

    return {
      statusCode:200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items : todos
      })
    }
  })

handler.use(
  cors({
    credentials: true,
    origin: "*"
  })
)
