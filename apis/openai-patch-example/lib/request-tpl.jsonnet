local parent = std.parseJson(std.extVar('parent'));

// See <https://jsonnet.org/ref/language.html>, sections
// "Inheritance" and "Nested Field Inheritance"

parent + {
  body+: {
    n: 3,
    temperature: 0.8,
  }
}
