"use client";

import { useAuth } from "@clerk/nextjs";
import { AddUserForm } from "@/components/users/AddUserForm";
import { UserList } from "@/components/users/UserList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UsersPage() {
    const { userId } = useAuth();

    if (!userId) {
        return <div>Please sign in to view users</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">User Management</h1>
            </div>
            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">Users List</TabsTrigger>
                    <TabsTrigger value="add">Add User</TabsTrigger>
                </TabsList>
                <TabsContent value="list">
                    <Card>
                        <CardHeader>
                            <CardTitle>Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <UserList />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="add">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New User</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AddUserForm />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 