"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">このサービスについて</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <section>
            <h2 className="text-xl font-semibold mb-3">サービス概要</h2>
            <p>Noteは、メモやノートをシンプルに作成・管理できるプラットフォームです。アイデアや情報を素早く記録し、整理することができます。</p>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">主な機能</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>ノート・メモの作成と編集</li>
              <li>カテゴリやタグによる整理</li>
              <li>全文検索機能</li>
              <li>Markdown対応</li>
              <li>ダークモード・多言語対応</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-3">技術スタック</h2>
            <p>Next.js / TypeScript / Prisma / Tailwind CSS</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
