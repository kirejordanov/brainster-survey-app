import routeHandler from "@/lib/routeHandler";
import prisma from "@/lib/prisma";
import Answer from "@/schemas/Answer";

export const GET = routeHandler(async (request, context) => {
  const { answerId } = context.params;
  const answer = await prisma.questionAnswer.findUniqueOrThrow({
    where: {
      id: answerId,
    },
  });

  return answer;
});

export const PATCH = routeHandler(async (request, context) => {
  const { surveyId, questionId, answerId } = context.params;
  const body = await request.json();
  const validation = await Answer.safeParseAsync(body);
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
          data: {
            answers: {
                update: {
                    where: {
                        id: answerId
                    },
                    data
                }
            }
          },
        },
      },
    },
    include: {
      questions: {
        include: {
          answers: true,
        },
      },
    },
  });

  return response;
});

export const DELETE = routeHandler(async (request, context) => {
  const { surveyId, questionId, answerId } = context.params;
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
          data: {
            answers: {
                delete: {
                    id: answerId
                }
            }
          },
        },
      },
    },
    include: {
      questions: {
        include: {
          answers: true,
        },
      },
    },
  });

  return response;
});


