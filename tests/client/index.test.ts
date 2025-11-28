import { describe, it, expect } from "vitest";
import { createClient, Client } from "../../src/client";

describe("Client", () => {
  describe("createClient", () => {
    it("should create a client instance with default config", () => {
      const client = createClient();

      expect(client).toBeInstanceOf(Client);
    });
  });
});
