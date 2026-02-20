"use client";

import { useState } from "react";
import { calcInheritanceTax, TaxInput, TaxResult } from "@/lib/taxCalc";

const defaultInput: TaxInput = {
  totalAssets: 0,
  heirsCount: 1,
  hasSpouse: false,
  childrenCount: 0,
  parentsCount: 0,
  siblingsCount: 0,
  debts: 0,
  lifeInsurance: 0,
  retirementBenefit: 0,
};

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin align-middle mr-2" />
  );
}

export default function Home() {
  const [input, setInput] = useState<TaxInput>(defaultInput);
  const [result, setResult] = useState<TaxResult | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [loadingMode, setLoadingMode] = useState<"simple" | "detail" | null>(null);
  const [copied, setCopied] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setInput((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === "number") {
      setInput((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setInput((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleCalculate() {
    const res = calcInheritanceTax(input);
    setResult(res);
    setExplanation("");
  }

  async function handleExplain(mode: "simple" | "detail") {
    if (!result) return;
    setLoadingMode(mode);
    setExplanation("");
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, result, mode }),
      });
      const data = await res.json();
      setExplanation(data.explanation || data.error || "エラーが発生しました");
    } catch {
      setExplanation("通信エラーが発生しました");
    } finally {
      setLoadingMode(null);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(window.location.origin).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 入力フォーム */}
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">入力情報</h2>

        <div className="space-y-4">
          {/* 遺産総額 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              遺産総額（万円）
            </label>
            <input
              type="number"
              name="totalAssets"
              value={input.totalAssets}
              onChange={handleChange}
              min={0}
              placeholder="例: 10000"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* 法定相続人の数 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              法定相続人の数（人）
            </label>
            <input
              type="number"
              name="heirsCount"
              value={input.heirsCount}
              onChange={handleChange}
              min={1}
              placeholder="例: 3"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* 相続人の内訳 */}
          <div className="border border-gray-200 rounded p-4 bg-gray-50">
            <p className="text-sm font-medium text-gray-600 mb-3">
              相続人の内訳
            </p>
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                name="hasSpouse"
                id="hasSpouse"
                checked={input.hasSpouse}
                onChange={handleChange}
                className="mr-2 w-4 h-4"
              />
              <label htmlFor="hasSpouse" className="text-sm text-gray-600">
                配偶者あり
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  子の人数
                </label>
                <input
                  type="number"
                  name="childrenCount"
                  value={input.childrenCount}
                  onChange={handleChange}
                  min={0}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  父母の人数
                </label>
                <input
                  type="number"
                  name="parentsCount"
                  value={input.parentsCount}
                  onChange={handleChange}
                  min={0}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  兄弟姉妹の人数
                </label>
                <input
                  type="number"
                  name="siblingsCount"
                  value={input.siblingsCount}
                  onChange={handleChange}
                  min={0}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
          </div>

          {/* 債務・葬儀費用 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              債務・葬儀費用（万円）
            </label>
            <input
              type="number"
              name="debts"
              value={input.debts}
              onChange={handleChange}
              min={0}
              placeholder="例: 500"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* 生命保険金 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              生命保険金（万円）
              <span className="text-xs text-gray-400 ml-1">
                ※非課税枠: 500万円×法定相続人数
              </span>
            </label>
            <input
              type="number"
              name="lifeInsurance"
              value={input.lifeInsurance}
              onChange={handleChange}
              min={0}
              placeholder="例: 1000"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* 退職手当金 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              退職手当金（万円）
              <span className="text-xs text-gray-400 ml-1">
                ※非課税枠: 500万円×法定相続人数
              </span>
            </label>
            <input
              type="number"
              name="retirementBenefit"
              value={input.retirementBenefit}
              onChange={handleChange}
              min={0}
              placeholder="例: 500"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          計算する
        </button>
      </section>

      {/* 計算結果 */}
      {result && (
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            計算結果
          </h2>

          {result.isExempt ? (
            <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-4 text-center">
              <p className="text-green-700 font-bold text-lg">
                相続税はかかりません
              </p>
              <p className="text-green-600 text-sm mt-1">
                課税遺産総額が基礎控除額以下です
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-center">
              <p className="text-sm text-blue-600 mb-1">相続税の総額（目安）</p>
              <p className="text-3xl font-bold text-blue-800">
                {result.totalTax.toLocaleString()} 万円
              </p>
            </div>
          )}

          {/* 計算ステップの内訳 */}
          <div className="space-y-4">
            {/* Step1 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Step 1: 非課税枠の適用
              </h3>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-1.5 text-gray-600">生命保険非課税額</td>
                    <td className="py-1.5 text-right font-medium">
                      {result.lifeInsuranceExemption.toLocaleString()} 万円
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-1.5 text-gray-600">退職手当非課税額</td>
                    <td className="py-1.5 text-right font-medium">
                      {result.retirementExemption.toLocaleString()} 万円
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gray-800 font-semibold">
                      正味の遺産額
                    </td>
                    <td className="py-1.5 text-right font-bold text-gray-800">
                      {result.netAssets.toLocaleString()} 万円
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Step2 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Step 2: 基礎控除
              </h3>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-1.5 text-gray-600">
                      基礎控除額（3,000万円 + 600万円×{input.heirsCount}人）
                    </td>
                    <td className="py-1.5 text-right font-medium">
                      {result.basicDeduction.toLocaleString()} 万円
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gray-800 font-semibold">
                      課税遺産総額
                    </td>
                    <td className="py-1.5 text-right font-bold text-gray-800">
                      {result.taxableAssets.toLocaleString()} 万円
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Step3 */}
            {!result.isExempt && result.heirShares.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Step 3: 法定相続分による按分と税額
                </h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-1.5 px-2 text-left text-gray-600 font-medium">
                        相続人
                      </th>
                      <th className="py-1.5 px-2 text-center text-gray-600 font-medium">
                        法定相続分
                      </th>
                      <th className="py-1.5 px-2 text-right text-gray-600 font-medium">
                        取得金額
                      </th>
                      <th className="py-1.5 px-2 text-right text-gray-600 font-medium">
                        税額
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.heirShares.map((heir, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="py-1.5 px-2 text-gray-700">
                          {heir.name}
                        </td>
                        <td className="py-1.5 px-2 text-center text-gray-600">
                          {heir.ratio}
                        </td>
                        <td className="py-1.5 px-2 text-right">
                          {heir.amount.toLocaleString()} 万円
                        </td>
                        <td className="py-1.5 px-2 text-right font-medium">
                          {heir.tax.toLocaleString()} 万円
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100">
                      <td
                        colSpan={3}
                        className="py-1.5 px-2 text-right font-semibold text-gray-700"
                      >
                        相続税の総額
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold text-blue-800">
                        {result.totalTax.toLocaleString()} 万円
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Step4: 配偶者控除 */}
            {result.spouseDeductionNote && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Step 4: 配偶者控除（目安）
                </h3>
                <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-3">
                  {result.spouseDeductionNote}
                </p>
              </div>
            )}
          </div>

          {/* Claude解説エリア */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">
              AI解説
            </h3>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => handleExplain("simple")}
                disabled={loadingMode !== null}
                className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg border border-gray-300 transition-colors flex items-center justify-center"
              >
                {loadingMode === "simple" ? (
                  <>
                    <Spinner />
                    解説中...
                  </>
                ) : (
                  "かんたん解説"
                )}
              </button>
              <button
                onClick={() => handleExplain("detail")}
                disabled={loadingMode !== null}
                className="flex-1 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 text-sm font-medium py-2 px-3 rounded-lg border border-blue-300 transition-colors flex items-center justify-center"
              >
                {loadingMode === "detail" ? (
                  <>
                    <Spinner />
                    解説中...
                  </>
                ) : (
                  "詳しく解説"
                )}
              </button>
            </div>

            {explanation && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {explanation}
              </div>
            )}
          </div>

          {/* URLシェア */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium py-2 px-4 rounded-lg border border-gray-300 transition-colors"
            >
              {copied ? "コピーしました！" : "リンクをコピー"}
            </button>
            <span className="text-xs text-gray-400">
              ツールのURLをシェアできます
            </span>
          </div>
        </section>
      )}

      <p className="text-xs text-gray-400 text-center mt-4">
        本ツールは概算の目安です。実際の税額は条件により異なります。税理士へのご相談をおすすめします。
      </p>
    </div>
  );
}
