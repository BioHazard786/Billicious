import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const usersTable = pgTable(
  "users_table",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    username: text("username").notNull().unique(),
    platform: text("platform").notNull(),
    name: text("name").notNull(),
    upiId: text("upi_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      usersTableUsernameIndex: index("users_table_username_index").on(
        table.username,
      ),
    };
  },
);

export const groupsTable = pgTable("groups_table", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  totalExpense: numeric("total_expense").notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const billsTable = pgTable(
  "bills_table",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: text("name").notNull(),
    amount: numeric("amount").notNull(),
    notes: text("notes"),
    groupId: text("group_id").references(() => groupsTable.id),
    isPayment: boolean("is_payment").default(false),
    category: text("category").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      billsTableGroupIdIndex: index("bills_table_group_id_index").on(
        table.groupId,
      ),
    };
  },
);

export const membersTable = pgTable(
  "members_table",
  {
    userId: text("user_id").notNull(),
    groupId: text("group_id").references(() => groupsTable.id),
    userNameInGroup: text("username_in_group").notNull(),
    isAdmin: boolean("is_admin").default(false),
    isTemporary: boolean("is_temporary").default(true),
    userIndex: integer("user_index"),
    totalSpent: numeric("total_spent").notNull().default("0"),
    totalPaid: numeric("total_paid").notNull().default("0"),
  },
  (table) => {
    return {
      primaryKey: primaryKey({
        name: "members_table_pk",
        columns: [table.userId, table.groupId],
      }),
      membersTableUserIdIndex: index("members_table_user_id_index").on(
        table.userId,
      ),
      membersTableGroupIdIndex: index("members_table_group_id_index").on(
        table.groupId,
      ),
    };
  },
);

export const transactionsTable = pgTable(
  "transactions_table",
  {
    groupId: text("group_id").references(() => groupsTable.id),
    user1Index: integer("user1_index").notNull(),
    user2Index: integer("user2_index").notNull(),
    balance: numeric("balance").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      primaryKey: primaryKey({
        name: "transactions_table_pk",
        columns: [table.groupId, table.user1Index, table.user2Index],
      }),
      transactionsTableGroupIdIndex: index(
        "transactions_table_group_id_index",
      ).on(table.groupId),
    };
  },
);

export const draweesInBillsTable = pgTable(
  "drawees_in_bills_table",
  {
    billId: text("bill_id").references(() => billsTable.id),
    userIndex: integer("user_index").notNull(),
    amount: numeric("amount").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      primaryKey: primaryKey({
        name: "drawees_in_bills_table_pk",
        columns: [table.billId, table.userIndex],
      }),
      draweesInBillsTableBillIdIndex: index(
        "drawees_in_bills_table_bill_id_index",
      ).on(table.billId),
    };
  },
);

export const payeesInBillsTable = pgTable(
  "payees_in_bills_table",
  {
    billId: text("bill_id").references(() => billsTable.id),
    userIndex: integer("user_index").notNull(),
    amount: numeric("amount").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      primaryKey: primaryKey({
        name: "payees_in_bills_table_pk",
        columns: [table.billId, table.userIndex],
      }),
      payeesInBillsTableBillIdIndex: index(
        "payees_in_bills_table_bill_id_index",
      ).on(table.billId),
    };
  },
);

export const requestTable = pgTable(
  "request_table",
  {
    userId: text("user_id").references(() => usersTable.id),
    groupId: text("group_id").references(() => groupsTable.id),
    userIndex: integer("user_index"),
  },
  (table) => {
    return {
      primaryKey: primaryKey({
        name: "request_table_pk",
        columns: [table.userId, table.groupId],
      }),
    };
  },
);
