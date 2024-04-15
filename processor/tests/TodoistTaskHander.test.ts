// import { Project, TodoistApi } from "@doist/todoist-api-typescript";
// import {
//   ProjectExtractionError,
//   TodoistTaskHandler,
// } from "../src/TodoistTaskHandler";

// const mockTodoistApi = {
//   getTasks: jest.fn() as jest.MockedFunction<
//     typeof TodoistApi.prototype.getTasks
//   >,
//   getComments: jest.fn() as jest.MockedFunction<
//     typeof TodoistApi.prototype.getComments
//   >,
//   updateTask: jest.fn() as jest.MockedFunction<
//     typeof TodoistApi.prototype.updateComment
//   >,
//   addComment: jest.fn() as jest.MockedFunction<
//     typeof TodoistApi.prototype.addComment
//   >,
// } as unknown as TodoistApi;

// const handler = new TodoistTaskHandler(mockTodoistApi);

// describe("TodoistApi", () => {
//   describe("extractProjects", () => {
//     it("should return a list of projects", async () => {
//       const mockProjects: Project[] = [
//         {
//           id: "1",
//           order: 1,
//           commentCount: 0,
//           url: "http://example.com",
//           name: "Test Project",
//           color: "red",
//           isShared: false,
//           isFavorite: false,
//           isInboxProject: false,
//           isTeamInbox: false,
//           viewStyle: "list",
//         },
//       ];

//       const getProjects = jest.fn() as jest.MockedFunction<
//         typeof TodoistApi.prototype.getProjects
//       >;

//       await expect(handler.extractProjects()).resolves.toEqual(mockProjects);
//     });

//     // it("should throw ProjectExtractionError on API failure", async () => {

//     //   const errorMessage = "Failed to fetch projects";
//     //   mockTodoistApi.getProjects.mockRejectedValue(new Error(errorMessage));

//     //   await expect(handler.extractProjects()).rejects.toThrow(
//     //     ProjectExtractionError
//     //   );
//     // });
//   });
// });
