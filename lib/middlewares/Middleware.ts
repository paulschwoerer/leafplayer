import { FastifyReply, FastifyRequest } from 'fastify';
import { RouteGenericInterface } from 'fastify/types/route';

export interface Middleware<TRequest = RouteGenericInterface> {
  (request: FastifyRequest<TRequest>, reply: FastifyReply): Promise<void>;
}
