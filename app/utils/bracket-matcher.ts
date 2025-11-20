/**
 * 使用中心扩散算法找到完整的花括号闭合区间
 *
 * @param sourceCode 源代码字符串
 * @param problemIndex 出问题代码的索引位置
 * @returns 完整的花括号闭合区间 [startIndex, endIndex]，如果找不到则返回 null
 */
export function findBracketRange(
  sourceCode: string,
  problemIndex: number
): [number, number] | null {
  if (problemIndex < 0 || problemIndex >= sourceCode.length) {
    return null;
  }

  // 中心扩散算法：从问题位置向两边扩散，找到最小的完整花括号块

  // 第一步：向左扫描，找到包含问题位置的最内层 '{'
  let bracketCount = 0;
  let startIndex = -1;

  // 向左扫描，找到最近的未闭合的 '{'
  for (let i = problemIndex; i >= 0; i--) {
    const char = sourceCode[i];

    if (char === "}") {
      bracketCount++;
    } else if (char === "{") {
      if (bracketCount === 0) {
        // 找到了包含问题位置的最内层起始 '{'
        startIndex = i;
        break;
      } else {
        bracketCount--;
      }
    }
  }

  // 如果向左没找到，尝试向右找最近的 '{'
  if (startIndex === -1) {
    bracketCount = 0;
    for (let i = problemIndex; i < sourceCode.length; i++) {
      const char = sourceCode[i];
      if (char === "{") {
        if (bracketCount === 0) {
          startIndex = i;
          break;
        }
        bracketCount++;
      } else if (char === "}") {
        bracketCount--;
      }
    }
  }

  if (startIndex === -1) {
    return null;
  }

  // 第二步：从起始位置向右扫描，找到对应的闭合 '}'
  bracketCount = 0;
  let endIndex = -1;

  for (let i = startIndex; i < sourceCode.length; i++) {
    const char = sourceCode[i];

    if (char === "{") {
      bracketCount++;
    } else if (char === "}") {
      bracketCount--;
      if (bracketCount === 0) {
        // 找到了对应的闭合 '}'
        endIndex = i;
        return [startIndex, endIndex];
      }
    }
  }

  // 如果没有找到闭合的 '}'，返回 null
  return null;
}

/**
 * 获取花括号闭合区间内的代码内容
 *
 * @param sourceCode 源代码字符串
 * @param problemIndex 出问题代码的索引位置
 * @returns 完整的花括号闭合区间内的代码内容，如果找不到则返回 null
 */
export function getBracketContent(
  sourceCode: string,
  problemIndex: number
): string | null {
  const range = findBracketRange(sourceCode, problemIndex);
  if (!range) {
    return null;
  }

  const [startIndex, endIndex] = range;
  return sourceCode.substring(startIndex, endIndex + 1);
}

/**
 * 查找所有包含指定索引的花括号块（从内到外）
 *
 * @param sourceCode 源代码字符串
 * @param problemIndex 出问题代码的索引位置
 * @returns 所有包含该索引的花括号块，从内到外排序
 */
export function findAllBracketRanges(
  sourceCode: string,
  problemIndex: number
): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  let currentIndex = problemIndex;

  // 递归查找所有嵌套的花括号块
  while (currentIndex >= 0 && currentIndex < sourceCode.length) {
    const range = findBracketRange(sourceCode, currentIndex);
    if (!range) {
      break;
    }

    const [start, end] = range;

    // 检查是否已经添加过这个范围（避免重复）
    const isDuplicate = ranges.some(
      ([existingStart, existingEnd]) =>
        existingStart === start && existingEnd === end
    );

    if (!isDuplicate) {
      ranges.push(range);
    }

    // 继续向外查找（从当前块的起始位置再向左找）
    if (start > 0) {
      currentIndex = start - 1;
    } else {
      break;
    }
  }

  // 按起始位置排序（从内到外）
  return ranges.sort((a, b) => b[0] - a[0]);
}
