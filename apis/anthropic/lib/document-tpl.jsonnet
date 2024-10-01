local response = std.parseJson(std.extVar("response"));

{
  doc: [
    {
      type: 'markdown',
      content: [
        {
          type: 'text',
          text: item.text
        }
      ]
    }
    for item in response.content
  ]
}
