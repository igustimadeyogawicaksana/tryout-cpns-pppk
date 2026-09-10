import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { uploadQuestions } from '$lib/server/question-api';
import type { RequestHandler } from './$types';
export const POST: RequestHandler = ({ request }) => uploadQuestions(request, db, env, false);
