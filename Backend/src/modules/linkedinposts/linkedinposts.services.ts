import { ApifyClient } from "apify-client";
import prisma from "../../config/prisma";

export interface LinkedinPost {
    text: string;
    likes: number;
    comments: number;
    shares: number;
    posted_at: string | null;
    post_url: string | null;
    image_url: string | null;
    images: string[];
    actor_name: string | null;
}

export interface LinkedinPostsResult {
    success: boolean;
    data: LinkedinPost[];
}

export class LinkedinPostsService {
    private client: ApifyClient;

    constructor() {
        if (!process.env.APIFY_TOKEN) {
            throw new Error("APIFY_TOKEN missing");
        }
        this.client = new ApifyClient({
            token: process.env.APIFY_TOKEN,
        });
    }

    async getCompanyPosts(linkedinUrl: string, maxPosts: number = 20): Promise<LinkedinPostsResult> {
        try {
            const normalizedUrl = linkedinUrl.replace(/\/$/, "");

            // CACHE CHECK
            const existing = await prisma.linkedinPosts.findUnique({
                where: { linkedinurl: normalizedUrl },
            });

            if (existing) {
                return { success: true, data: existing.posts_data as any };
            }

            // RUN ACTOR
            const run = await this.client.actor("dRMwHz7Yx7Q4LGVFM").call({
                companies: [normalizedUrl],
                max_posts: maxPosts,
            });

            // FETCH RESULTS
            const { items } = await this.client
                .dataset(run.defaultDatasetId)
                .listItems();

            const data: LinkedinPost[] = items
                .filter((item: any) => item.text)
                .map((item: any) => ({
                    text: item.text || "",
                    likes: item.reactions ?? item.likes ?? 0,
                    comments: item.comments ?? 0,
                    shares: item.shares ?? 0,
                    posted_at: item.postedAgo ?? item.postedAt ?? null,
                    post_url: item.attributed_urn ?? item.activity_urn ?? null,
                    image_url: item.image_url ?? item.images?.[0] ?? null,
                    images: item.images ?? [],
                    actor_name: item.actor_name ?? null,
                }));

            // SAVE
            await prisma.linkedinPosts.upsert({
                where: { linkedinurl: normalizedUrl },
                update: { posts_data: data },
                create: {
                    linkedinurl: normalizedUrl,
                    posts_data: data,
                },
            });

            return { success: true, data };

        } catch (err: any) {
            console.error("[LinkedinPostsService] Error:", err.message);
            return { success: false, data: [] };
        }
    }
}

export default new LinkedinPostsService();