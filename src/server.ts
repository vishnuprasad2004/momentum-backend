import { generateNotificationMessage, generateMotivationalMessage } from "./service/openai";
import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import dotenv from "dotenv";
import supabase from "./service/supabase";
dotenv.config();

// types
type User = {
    id: string;
    updated_at: string;
    name: string;
    user_push_token: string;
    allow_notifications: boolean;
    last_notified: string;
    total_completed_tasks: number;
};

// Base notification interval (3 hours) in milliseconds
const BASE_INTERVAL_MS = 3 * 60 * 60 * 1000;

const notificationHeaders = ["📌 Quick Reminder", "Heads Up!", "Just a Nudge 🤏", "Friendly Reminder", "Keep it Moving 🙆!", "Don't Forget!", "Time to Shine ✨!", "Raise up your Aura!"];

// Initialize Expo SDK
let expo = new Expo({});

async function sendPushNotificationsAsync() {
    try {
        const { data: users, error:fetchError } = await supabase
            .from("profiles")
            .select("*")
            .eq("allow_notifications", true);

        // Check if users exist and handle errors
        if (!users || users.length === 0 || fetchError) {
            console.log("No users found or error fetching users.", fetchError);
            return;
        }

        let messages: ExpoPushMessage[] = [];

        // for each user, get their tasks and send a notification if they have any tasks due in the next 3 hours
        for (let i = 0; i < users.length; i++) {
            
            const { id, name, user_push_token, last_notified } = users[i] as User;

            // const lastNotifiedDate = new Date(last_notified);
            // const now = new Date();
            // const timeSinceLastNotified = now.getTime() - lastNotifiedDate.getTime();
            // const shouldNotify = timeSinceLastNotified >= BASE_INTERVAL_MS;

            // Check if user_push_token is valid
            if (!Expo.isExpoPushToken(user_push_token)) {
                console.log(`Push token ${user_push_token} is not valid for user ${name} OR We cannot notify them.`);
                continue;
            }

            // Get tasks for each user
            const { data: todos, error: tasksError } = await supabase
                .from("todos")
                .select("*")
                .eq("user_id", id)
                .eq("is_completed", false)
                .order("deadline", { ascending: true });
            // console.log("Todos:", todos);

            // No tasks found for this user
            if (!todos || todos.length === 0) {
                console.log("No tasks found or error fetching tasks.");
                if (Math.random() < 0.4) { // 40% chance to send a motivational message
                    const motivationalMessage = await generateMotivationalMessage();
                    messages.push({
                        to: user_push_token,
                        channelId: "default",
                        title: notificationHeaders[Math.floor(Math.random() * notificationHeaders.length)],
                        body: motivationalMessage || "Rise up and do your duty to yourself!, was that good enough motivation for you ? Get cracking!",
                        priority: "high",
                    })
                }
                continue;
            }

            if (tasksError) {
                console.log("Error fetching tasks:", tasksError);
                continue;
            }

            let randomTask = todos[Math.floor(Math.random() * todos.length)];
        
            // Generate the notification message using OpenAI
            const notificationMessage = await generateNotificationMessage({
                name,
                title: randomTask.title,
                deadline: randomTask.deadline,
            });

            messages.push({
                to: user_push_token,
                channelId: "default",
                title: notificationHeaders[Math.floor(Math.random() * notificationHeaders.length)],
                body: notificationMessage || "You have a task due soon!",
                priority: "high",
            });
        }

        const tickets: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(messages);
        
        const logs = await supabase.from("logs").insert([
            {
                status: tickets[0].status,
                sent_at: new Date().toISOString(),
                log: {
                    ticket: tickets,
                    messages: messages,
                },
                error: fetchError,
            }
        ])

        // Update the last_notified field for each user
    } catch (error) {
        console.log("Error sending notification:", error);
    }
}
if(require.main === module) {
    sendPushNotificationsAsync();
}