// imports
import { describe, it, expect, vi, afterEach } from "vitest";
import { banUser, suspendUser, reinstateUser } from "../models/userModel.js";
import db from "../config/db.js";


// cleanup after each test
afterEach(() => {
    vi.restoreAllMocks();
});

// test suites

describe("banUser", () => {

    it("should update user status to banned and record admin action", async () => {

        const action = "ban";
        const status = "banned";

        // 1. ARRANGE
        // Prepare test data 
        const userId = 77;
        const adminId = 2;
        const reason = "repeated violations of guidelines";

        // mock db
        const querySpy = vi.spyOn(db, "query").mockResolvedValue(undefined); //promise that resolves to undefined

        // 2. ACT
        // Execute banUser()
        await banUser(userId, adminId, reason);


        // 3. ASSERT
        // Verify database calls
        expect(querySpy).toHaveBeenCalledTimes(2);
        expect(querySpy).toHaveBeenNthCalledWith(1, expect.stringContaining("UPDATE users"), [status, userId]);
        expect(querySpy).toHaveBeenNthCalledWith(2, expect.stringContaining("INSERT INTO user_admin_actions"), [userId, adminId, action, reason] );
    });

});


describe("suspendUser", () => {

    it("should update user status to suspended and record admin action", async () => {

        const action = "suspend";
        const status = "suspended";

        // 1. ARRANGE
        // Prepare test data 
        const userId = 77;
        const adminId = 2;
        const reason = "violated multiple guidelines";

        // mock db
        const querySpy = vi.spyOn(db, "query").mockResolvedValue(undefined); //promise that resolves to undefined

        // 2. ACT
        // Execute suspendUser()
        await suspendUser(userId, adminId, reason);


        // 3. ASSERT
        // Verify database calls
        expect(querySpy).toHaveBeenCalledTimes(2);
        expect(querySpy).toHaveBeenNthCalledWith(1, expect.stringContaining("UPDATE users"), [status, userId]);
        expect(querySpy).toHaveBeenNthCalledWith(2, expect.stringContaining("INSERT INTO user_admin_actions"), [userId, adminId, action, reason] );
    });

});


describe("reinstateUser", () => {

    it("should update user status to active and record admin action", async () => {

        const action = "reinstate";
        const status = "active";

        // 1. ARRANGE
        // Prepare test data 
        const userId = 77;
        const adminId = 2;
        const reason = "violated multiple guidelines";

        // mock db
        const querySpy = vi.spyOn(db, "query").mockResolvedValue(undefined); //promise that resolves to undefined

        // 2. ACT
        // Execute reinstateUser()
        await reinstateUser(userId, adminId, reason);


        // 3. ASSERT
        // Verify database calls
        expect(querySpy).toHaveBeenCalledTimes(2);
        expect(querySpy).toHaveBeenNthCalledWith(1, expect.stringContaining("UPDATE users"), [status, userId]);
        expect(querySpy).toHaveBeenNthCalledWith(2, expect.stringContaining("INSERT INTO user_admin_actions"), [userId, adminId, action, reason] );
    });

});