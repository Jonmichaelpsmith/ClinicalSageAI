import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";

export default function CoAuthor() {
  return (
    <div className="container mx-auto p-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">eCTD Co-Author Module</CardTitle>
          <CardDescription>
            Enterprise-grade eCTD authoring and submission tool with AI-powered assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            The eCTD Co-Author module provides a comprehensive suite of tools for creating, editing, 
            and managing eCTD submissions with AI assistance, regulatory validation, and team collaboration.
          </p>
          
          <div className="flex justify-center mt-6">
            <Button className="mr-4" asChild>
              <a href="/client-portal">Return to Client Portal</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}