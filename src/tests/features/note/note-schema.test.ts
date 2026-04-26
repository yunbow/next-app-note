import { describe, it, expect } from "vitest";
import {
  CreateNoteSchema,
  UpdateNoteSchema,
  CreateNoteVersionSchema,
  CreateNoteShareSchema,
  CreateNoteLinkSchema,
} from "@/features/note/schema/note-schema";

describe("CreateNoteSchema", () => {
  it("should validate valid note data", () => {
    const validData = {
      title: "テストノート",
      content: "これはテストノートの内容です。",
      visibility: "private" as const,
    };

    const result = CreateNoteSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should validate note with tags and categories", () => {
    const validData = {
      title: "テストノート",
      content: "これはテストノートの内容です。",
      visibility: "public" as const,
      tagIds: ["tag-1", "tag-2"],
      categoryIds: ["cat-1"],
    };

    const result = CreateNoteSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty title", () => {
    const invalidData = {
      title: "",
      content: "これはテストノートの内容です。",
    };

    const result = CreateNoteSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject title exceeding 200 characters", () => {
    const invalidData = {
      title: "a".repeat(201),
      content: "これはテストノートの内容です。",
    };

    const result = CreateNoteSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject empty content", () => {
    const invalidData = {
      title: "テストノート",
      content: "",
    };

    const result = CreateNoteSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should validate all visibility options", () => {
    const visibilities = ["private", "shared", "public"] as const;

    visibilities.forEach((visibility) => {
      const validData = {
        title: "テストノート",
        content: "これはテストノートの内容です。",
        visibility,
      };

      const result = CreateNoteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  it("should reject invalid visibility", () => {
    const invalidData = {
      title: "テストノート",
      content: "これはテストノートの内容です。",
      visibility: "invalid",
    };

    const result = CreateNoteSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("UpdateNoteSchema", () => {
  it("should validate valid update data", () => {
    const validData = {
      id: "note-123",
      title: "更新されたタイトル",
      content: "更新された内容",
    };

    const result = UpdateNoteSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should validate partial update", () => {
    const validData = {
      id: "note-123",
      title: "更新されたタイトル",
    };

    const result = UpdateNoteSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject missing id", () => {
    const invalidData = {
      title: "更新されたタイトル",
    };

    const result = UpdateNoteSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("CreateNoteVersionSchema", () => {
  it("should validate valid version data", () => {
    const validData = {
      noteId: "note-123",
      content: "バージョンのコンテンツ",
    };

    const result = CreateNoteVersionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty noteId", () => {
    const invalidData = {
      noteId: "",
      content: "バージョンのコンテンツ",
    };

    const result = CreateNoteVersionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject empty content", () => {
    const invalidData = {
      noteId: "note-123",
      content: "",
    };

    const result = CreateNoteVersionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("CreateNoteShareSchema", () => {
  it("should validate valid share data", () => {
    const validData = {
      noteId: "note-123",
      permission: "view" as const,
    };

    const result = CreateNoteShareSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should validate share with password", () => {
    const validData = {
      noteId: "note-123",
      permission: "edit" as const,
      password: "secret123",
    };

    const result = CreateNoteShareSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should validate all permission types", () => {
    const permissions = ["view", "edit"] as const;

    permissions.forEach((permission) => {
      const validData = {
        noteId: "note-123",
        permission,
      };

      const result = CreateNoteShareSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  it("should reject password less than 6 characters", () => {
    const invalidData = {
      noteId: "note-123",
      permission: "view" as const,
      password: "12345",
    };

    const result = CreateNoteShareSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject invalid permission", () => {
    const invalidData = {
      noteId: "note-123",
      permission: "invalid",
    };

    const result = CreateNoteShareSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("CreateNoteLinkSchema", () => {
  it("should validate valid link data", () => {
    const validData = {
      sourceNoteId: "note-123",
      targetNoteId: "note-456",
    };

    const result = CreateNoteLinkSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty sourceNoteId", () => {
    const invalidData = {
      sourceNoteId: "",
      targetNoteId: "note-456",
    };

    const result = CreateNoteLinkSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject empty targetNoteId", () => {
    const invalidData = {
      sourceNoteId: "note-123",
      targetNoteId: "",
    };

    const result = CreateNoteLinkSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
