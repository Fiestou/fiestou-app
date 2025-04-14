const hasNonNumeric = (value: string): boolean => {
    const onlyNonNumeric = value.replace(/\d/g, "");
    return onlyNonNumeric.length > 0;
};

export { hasNonNumeric };