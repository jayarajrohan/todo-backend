exports.noSpecialCharsNoWhiteSpacesAtTheStartAndAtTheEndRegex =
  /^(?!\s)(?!.*\s{2})[a-zA-Z0-9\s]*\w$/;

exports.passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+~`\-={}[\]\\|:;"'<>,.?/])[A-Za-z\d!@#$%^&*()_+~`\-={}[\]\\|:;"'<>,.?/]{6,}$/;
