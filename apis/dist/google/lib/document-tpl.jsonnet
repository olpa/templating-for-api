local response = std.parseJson(std.extVar("response"));

{
  doc: std.flattenArrays([
    [
      {
        type: "markdown",
        content: [{
          type: "text",
          text: part.text,
        }]
      }
      for part in candidate.content.parts
    ]
    for candidate in response.candidates
  ])
}
