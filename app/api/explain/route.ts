import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT =
  "あなたは相続税の計算結果をわかりやすく説明するアシスタントです。専門用語は避け、一般の方にわかる日本語で説明してください。";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, result, mode } = body;

    if (!input || !result || !mode) {
      return NextResponse.json(
        { error: "input, result, mode は必須です" },
        { status: 400 }
      );
    }

    const inputSummary = `
遺産総額: ${input.totalAssets}万円
法定相続人数: ${input.heirsCount}人
配偶者: ${input.hasSpouse ? "あり" : "なし"}
子: ${input.childrenCount}人
父母: ${input.parentsCount}人
兄弟姉妹: ${input.siblingsCount}人
債務・葬儀費用: ${input.debts}万円
生命保険金: ${input.lifeInsurance}万円
退職手当金: ${input.retirementBenefit}万円
    `.trim();

    const resultSummary = `
生命保険非課税額: ${result.lifeInsuranceExemption}万円
退職手当非課税額: ${result.retirementExemption}万円
正味の遺産額: ${result.netAssets}万円
基礎控除額: ${result.basicDeduction}万円
課税遺産総額: ${result.taxableAssets}万円
相続税の総額: ${result.totalTax}万円
非課税: ${result.isExempt ? "はい（相続税はかかりません）" : "いいえ"}
    `.trim();

    let userPrompt: string;
    let model: string;
    let maxTokens: number;

    if (mode === "simple") {
      model = "claude-haiku-4-5";
      maxTokens = 700;
      userPrompt = `以下の相続税計算の入力と結果を日本語で簡潔に3〜4文でまとめてください。

【入力情報】
${inputSummary}

【計算結果】
${resultSummary}`;
    } else {
      model = "claude-sonnet-4-6";
      maxTokens = 700;
      userPrompt = `以下の相続税計算の結果について、400文字以内で、節税ポイントや注意点を含めてわかりやすく解説してください。

【入力情報】
${inputSummary}

【計算結果】
${resultSummary}`;
    }

    const message = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const explanation =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { error: "解説の生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
