export interface TaxInput {
  totalAssets: number; // 遺産総額（万円）
  heirsCount: number; // 法定相続人の数
  hasSpouse: boolean; // 配偶者の有無
  childrenCount: number; // 子の人数
  parentsCount: number; // 父母の人数
  siblingsCount: number; // 兄弟姉妹の人数
  debts: number; // 債務・葬儀費用（万円）
  lifeInsurance: number; // 生命保険金（万円）
  retirementBenefit: number; // 退職手当金（万円）
}

export interface HeirShare {
  name: string;
  ratio: string; // 割合の文字列表現
  amount: number; // 取得金額（万円）
  tax: number; // 税額（万円）
}

export interface TaxResult {
  lifeInsuranceExemption: number; // 生命保険非課税額（万円）
  retirementExemption: number; // 退職手当非課税額（万円）
  netAssets: number; // 正味の遺産額（万円）
  basicDeduction: number; // 基礎控除額（万円）
  taxableAssets: number; // 課税遺産総額（万円）
  heirShares: HeirShare[]; // 各相続人の按分
  totalTax: number; // 相続税の総額（万円）
  isExempt: boolean; // 非課税フラグ
  spouseDeductionNote: string; // 配偶者控除の目安説明
}

// 速算表で税額を計算（万円単位）
function calcTaxByTable(amount: number): number {
  if (amount <= 0) return 0;
  if (amount <= 1000) return Math.floor(amount * 0.1);
  if (amount <= 3000) return Math.floor(amount * 0.15 - 50);
  if (amount <= 5000) return Math.floor(amount * 0.2 - 200);
  if (amount <= 10000) return Math.floor(amount * 0.3 - 700);
  if (amount <= 20000) return Math.floor(amount * 0.4 - 1700);
  if (amount <= 30000) return Math.floor(amount * 0.45 - 2700);
  if (amount <= 60000) return Math.floor(amount * 0.5 - 4200);
  return Math.floor(amount * 0.55 - 7200);
}

// 法定相続分に基づく各相続人の按分を計算
function calcHeirShares(
  taxableAssets: number,
  input: TaxInput
): HeirShare[] {
  const shares: HeirShare[] = [];

  if (taxableAssets <= 0) return shares;

  const { hasSpouse, childrenCount, parentsCount, siblingsCount } = input;

  if (hasSpouse) {
    if (childrenCount > 0) {
      // 配偶者1/2、子で残りを均等
      const spouseAmount = Math.floor(taxableAssets * (1 / 2));
      shares.push({
        name: "配偶者",
        ratio: "1/2",
        amount: spouseAmount,
        tax: calcTaxByTable(spouseAmount),
      });
      const childShare = taxableAssets - spouseAmount;
      const perChild = Math.floor(childShare / childrenCount);
      for (let i = 1; i <= childrenCount; i++) {
        shares.push({
          name: `子${i}`,
          ratio: `1/${childrenCount * 2}`,
          amount: perChild,
          tax: calcTaxByTable(perChild),
        });
      }
    } else if (parentsCount > 0) {
      // 配偶者2/3、父母で残りを均等
      const spouseAmount = Math.floor(taxableAssets * (2 / 3));
      shares.push({
        name: "配偶者",
        ratio: "2/3",
        amount: spouseAmount,
        tax: calcTaxByTable(spouseAmount),
      });
      const parentShare = taxableAssets - spouseAmount;
      const perParent = Math.floor(parentShare / parentsCount);
      for (let i = 1; i <= parentsCount; i++) {
        shares.push({
          name: `父母${i}`,
          ratio: `1/${parentsCount * 3}`,
          amount: perParent,
          tax: calcTaxByTable(perParent),
        });
      }
    } else {
      // 配偶者全部
      shares.push({
        name: "配偶者",
        ratio: "全部",
        amount: taxableAssets,
        tax: calcTaxByTable(taxableAssets),
      });
    }
  } else {
    if (childrenCount > 0) {
      // 子で均等
      const perChild = Math.floor(taxableAssets / childrenCount);
      for (let i = 1; i <= childrenCount; i++) {
        shares.push({
          name: `子${i}`,
          ratio: `1/${childrenCount}`,
          amount: perChild,
          tax: calcTaxByTable(perChild),
        });
      }
    } else if (parentsCount > 0) {
      // 父母で均等
      const perParent = Math.floor(taxableAssets / parentsCount);
      for (let i = 1; i <= parentsCount; i++) {
        shares.push({
          name: `父母${i}`,
          ratio: `1/${parentsCount}`,
          amount: perParent,
          tax: calcTaxByTable(perParent),
        });
      }
    } else if (siblingsCount > 0) {
      // 兄弟姉妹で均等
      const perSibling = Math.floor(taxableAssets / siblingsCount);
      for (let i = 1; i <= siblingsCount; i++) {
        shares.push({
          name: `兄弟姉妹${i}`,
          ratio: `1/${siblingsCount}`,
          amount: perSibling,
          tax: calcTaxByTable(perSibling),
        });
      }
    }
  }

  return shares;
}

export function calcInheritanceTax(input: TaxInput): TaxResult {
  const { totalAssets, heirsCount, hasSpouse, debts, lifeInsurance, retirementBenefit } = input;

  // Step1: 非課税枠の適用
  const lifeInsuranceExemption = Math.min(lifeInsurance, 500 * heirsCount);
  const retirementExemption = Math.min(retirementBenefit, 500 * heirsCount);
  const netAssets = Math.max(
    0,
    totalAssets - debts - lifeInsuranceExemption - retirementExemption
  );

  // Step2: 基礎控除
  const basicDeduction = 3000 + 600 * heirsCount;
  const taxableAssets = Math.max(0, netAssets - basicDeduction);
  const isExempt = taxableAssets <= 0;

  // Step3: 法定相続分で按分 → 相続税の総額
  const heirShares = calcHeirShares(taxableAssets, input);
  const totalTax = heirShares.reduce((sum, h) => sum + h.tax, 0);

  // Step4: 配偶者控除の目安説明
  let spouseDeductionNote = "";
  if (hasSpouse) {
    spouseDeductionNote =
      "配偶者控除により、配偶者が実際に取得した財産が「1億6,000万円」または「配偶者の法定相続分相当額」のいずれか大きい金額まで相続税はかかりません（申告が必要です）。";
  }

  return {
    lifeInsuranceExemption,
    retirementExemption,
    netAssets,
    basicDeduction,
    taxableAssets,
    heirShares,
    totalTax,
    isExempt,
    spouseDeductionNote,
  };
}
