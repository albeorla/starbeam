import { Project, Task, TodoistApi } from "@doist/todoist-api-typescript";


export class TodoistTaskHandler {
  constructor(private todoistApi: TodoistApi) {
    if (!todoistApi) {
      throw new Error('TodoistApi instance is required.');
    }
  }

  async extractProjects(): Promise<Project[]> {
    try {
      return this.todoistApi.getProjects();
    } catch (error: any) {
      throw new ProjectExtractionError("Error extracting projects", error);
    }
  }

  async extractTasksByProject(
    projects: Project[],
    projectFilter: string
  ): Promise<Task[]> {
    try {
      const tasksPromises = projects
        .filter((project) => new RegExp(projectFilter, "i").test(project.name))
        .map((project) => this.todoistApi.getTasks({ projectId: project.id }));

      const tasks = await Promise.all(tasksPromises);
      return tasks.flat();
    } catch (error: any) {
      throw new TaskExtractionError("Error extracting tasks", error);
    }
  }

  async extractCommentsByTask(id: string) {
    try {
      const comments = await this.todoistApi.getComments({ taskId: id });
      return comments.map((comment) => comment.content);
    } catch (error: any) {
      console.log(error)
      throw new CommentExtractionError("Error extracting comments", error);
    }
  }

  async updateTask(id: string, content: string, description: string) {
    try {
      await this.todoistApi.updateTask(id, { content, description });
    } catch (error: any) {
      throw new TaskUpdateError("Error updating task", error);
    }
  }

  async addComment(id: string, content: string) {
    try {
      await this.todoistApi.addComment({ taskId: id, content });
    } catch (error: any) {
      throw new CommentAddError("Error adding comment", error);
    }
  }
}

export class ProjectExtractionError extends Error {
  constructor(message: string, error: Error) {
    super(message);
    this.name = "ProjectExtractionError";
    this.stack = error.stack;
  }
}

export class TaskExtractionError extends Error {
  constructor(message: string, error: Error) {
    super(message);
    this.name = "TaskExtractionError";
    this.stack = error.stack;
  }
}

export class CommentExtractionError extends Error {
  constructor(message: string, error: Error) {
    super(message);
    this.name = "CommentExtractionError";
    this.stack = error.stack;
  }
}

export class TaskUpdateError extends Error {
  constructor(message: string, error: Error) {
    super(message);
    this.name = "TaskUpdateError";
    this.stack = error.stack;
  }
}

export class CommentAddError extends Error {
  constructor(message: string, error: Error) {
    super(message);
    this.name = "CommentAddError";
    this.stack = error.stack;
  }
}