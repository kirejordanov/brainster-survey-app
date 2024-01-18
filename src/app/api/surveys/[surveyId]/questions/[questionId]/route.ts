import routeHandler from "@/lib/routeHandler";
import prisma from "@/lib/prisma";
import Question from "@/schemas/Question";

export const GET = routeHandler(async (request, context) => {
  const { questionId } = context.params;
  const question = await prisma.question.findUniqueOrThrow({
    where: {
      id: questionId,
    },
  });

  return question;
});

export const PATCH = routeHandler(async (request, context) => {
  const { surveyId, questionId } = context.params;
  const body = await request.json();
  const validation = await Question.safeParseAsync(body);
  if (!validation.success) {
    throw validation.error;
  }

  const { data } = validation;

  const response = await prisma.survey.update({
    where: {
      id: surveyId,
    },
    data: {
      questions: {
        update: {
          where: {
            id: questionId,
          },
          data,
        },
      },
    },
  });

  return response;
});

export const DELETE = routeHandler(async (request, context) => {
  const { surveyId, questionId } = context.params;
  const response = await prisma.survey.update({
    where: {
      id: surveyId,
    },
    data: {
      questions: {
        delete: {
          id: questionId,
        },
      },
    },
    include: {
      questions: true,
    },
  });

  return response;
});
