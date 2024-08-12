import { integer, numeric, pgTable, serial, text, timestamp, primaryKey, index } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users_table', {
    id: serial('id').primaryKey(),
    username: text('username').notNull().unique(),
    name: text('name').notNull(),
    upiId: text('upi_id'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().$onUpdate(() => new Date()),
});


export const groupsTable = pgTable('groups_table', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().$onUpdate(() => new Date()),
});


export const billsTable = pgTable('bills_table', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    amount: numeric('amount').notNull(),
    notes: text('notes'),
    groupId: integer('group_id').references(() => groupsTable.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().$onUpdate(() => new Date()),
    }, (table) => {
        return {
            billsTableGroupIdIndex: index("bills_table_group_id_index").on(table.groupId),
        }
    }
);


export const usersGroupsTable = pgTable('users_groups_table', {
    userId: text('user_id').notNull(),
    groupId: integer('group_id').references(() => groupsTable.id),
    userNameInGroup: text('username_in_group').notNull(),
    userIndex: integer('user_index'),
    totalAmount: numeric('total_amount').notNull()
    }, (table) => {
        return {
            primaryKey: primaryKey({ name: 'users_group_table_pk', columns: [table.userId, table.groupId] }),
            usersGroupsTableUserIdIndex: index("users_groups_table_user_id_index").on(table.userId),
            usersGroupsTableGroupIdIndex: index("users_groups_table_group_id_index").on(table.groupId),
        }
});


export const transactionsTable = pgTable('transactions_table', {
    groupId: integer('group_id').references(() => groupsTable.id),
    user1Index: integer('user1_index').notNull(),
    user2Index: integer('user2_index').notNull(),
    balance: numeric('balance').notNull(),
    }, (table) => {
        return {
            primaryKey: primaryKey({ name: 'transactions_table_pk', columns: [table.groupId, table.user1Index,table.user2Index] }),
            transactionsTableGroupIdIndex: index("transactions_table_group_id_index").on(table.groupId),
        }
    }
);


export const draweesInBills = pgTable('drawees_in_bills_table', {
    billId: integer('bill_id').references(() => billsTable.id),
    userIndex: integer('user_index').notNull(),
    amount: numeric('amount').notNull(),
    }, (table) => {
        return {
            primaryKey: primaryKey({ name: 'drawees_in_bills_table_pk', columns: [table.billId, table.userIndex] }),
            draweesInBillsTableBillIdIndex: index("drawees_in_bills_table_bill_id_index").on(table.billId),
        }
});


export const payeesInBills = pgTable('payees_in_bills_table', {
    billId: integer('bill_id').references(() => billsTable.id),
    userIndex: integer('user_index').notNull(),
    amount: numeric('amount').notNull(),
    }, (table) => {
        return {
            primaryKey: primaryKey({ name: 'payees_in_bills_table_pk', columns: [table.billId, table.userIndex] }),
            payeesInBillsTableBillIdIndex: index("payees_in_bills_table_bill_id_index").on(table.billId),
        }
});


