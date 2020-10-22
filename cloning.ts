  deepClone(arrToCopy) {
    let newArr, value, key;
    if (typeof arrToCopy !== 'object' || arrToCopy === null) {
      return arrToCopy;
    }
    newArr = Array.isArray(arrToCopy) ? [] : {};
    for (key in arrToCopy) {
      value = arrToCopy[key];
      newArr[key] = this.deepCloneArr(value);
    }
    return newArr;
  }

  // terrible for nested and cmoplex obj/arr's
  deepClone(arrToCopy) {
    return newArr = JSON.parse(JSON.stringify(arrToCopy))
  }
  
  shallowClone(arrToClone) {
    let newArr = [...arrToClone];
     return newArr;
  }
