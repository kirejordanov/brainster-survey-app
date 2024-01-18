import routeHandler from "@/lib/routeHandler";
import prisma from "@/lib/prisma";
import Answer from "@/schemas/Answer";

export const GET = routeHandler(async (request, context) => {
  const { questionId } = context.params;
  const answers = await prisma.questionAnswer.findMany({
    where: {
      questionId,
    },
  });

  return answers;
});

export const POST = routeHandler(async (request, context) => {
  const { surveyId, questionId } = context.params;
  const survey = await prisma.survey.findUniqueOrThrow({
    where: {
      id: surveyId,
    }
  });

  const body = await request.json();
  const validation = await Answer.safeParseAsync(body);

  if (!validation.success) {
    throw validation.error;
  }

  const { data } = validation;
  const surveyWithQuestions = await prisma.survey.update({
    where: {
      id: surveyId,
    },
    data: {
      questions: {
        update: {
          where: {
            id: questionId
          },
          data: {
            answers: {
              create: {
                ...data
              }
            }
          }
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

  return surveyWithQuestions;
});
