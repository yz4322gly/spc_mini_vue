/**
 * 快排
 * @param arr
 * @returns {*}
 */
export function quickSort(arr) {
  if (arr.length < 2) {
    return arr;
  }
  const pivotIndex = Math.floor(arr.length / 2);
  const pivot = arr[pivotIndex];
  const left = [];
  const right = [];
  const newArr = arr.slice(); // 创建原数组的一个副本，避免直接修改原数组

  for (let i = 0; i < newArr.length; i++) {
    if (i === pivotIndex) continue; // 跳过主元
    if (newArr[i] < pivot) {
      left.push(newArr[i]);
    } else {
      right.push(newArr[i]);
    }
  }

  return quickSort(left).concat(pivot, quickSort(right));
}

//计算正态曲线
export function fxNormalDistribution(array, std, mean) {
  let valueList = [];
  for (let i = 0; i < array.length; i++) {
    let ND =
      Math.sqrt(2 * Math.PI) *
      std *
      Math.pow(
        Math.E,
        -(Math.pow(array[i] - mean, 2) / (2 * Math.pow(std, 2)))
      );
    valueList.push(ND.toFixed(3));
  }
  return valueList;
}

//计算标准差
export function getStd(data, mean) {
  let sumXY = function (x, y) {
    return Number(x) + Number(y);
  };
  let square = function (x) {
    return Number(x) * Number(x);
  };
  let deviations = data.map(function (x) {
    return x - mean;
  });
  return Math.sqrt(deviations.map(square).reduce(sumXY) / (data.length - 1));
}


export function getMedianNoSort(arr) {
  let sorted = quickSort(arr)
  return getMedianSorted(sorted)
}


//对有序数组求中位数
export function getMedianSorted(arr) {
  // 获取数组长度
  let len = arr.length;

  // 如果没有元素，返回undefined或你可以返回其他合适的值
  if (len === 0) {
    return undefined;
  }

  // 如果只有一个元素，那么它就是中位数
  if (len === 1) {
    return arr[0];
  }

  // 如果数组长度是奇数，返回中间的数
  if (len % 2 === 1) {
    return arr[Math.floor(len / 2)];
  }

  // 如果数组长度是偶数，返回中间两个数的平均值
  else {
    let mid1 = arr[len / 2 - 1];
    let mid2 = arr[len / 2];
    return (mid1 + mid2) / 2.0;
  }
}

 export function calcCa(mean, target,usl, lsl) {
  // 制程准确度 Ca = (X - U) / (T / 2)
  const tolerance = usl - lsl;
  return (mean - target) / (tolerance / 2);
}

 export function calcCp(mean, std, usl, lsl) {
  // 制程精密度 Cp = T / (6 * σ)
  const tolerance = usl - lsl;
  return tolerance / (6 * std);
}

/**
 * 基于制程平均值、规格上下限和样本标准差：
 * 与target无关，即上下限的中心值为target，不考虑上下限距离不等
 * CPK = min[(USL - Xbar), (Xbar - LSL)] / (3 * σ)
 * @param mean
 * @param std
 * @param usl
 * @param lsl
 * @returns {number}
 */
 export function calcCpk(mean, std, usl, lsl) {
  // 制程能力指数 Cpk
  const cpkUpper = (usl - mean) / (3 * std);
  const cpkLower = (mean - lsl) / (3 * std)
  return Math.min(cpkUpper, cpkLower);
}

/**
 * 基于制程准确度Ca和制程精密度Cp：
 * 与target有关
 * CPK = Cp * (1 - |Ca|)
 * @param ca
 * @param cp
 * @returns {number}
 */
export function calcCpk2(ca,cp) {
  return cp * (1 - Math.abs(ca));
}
