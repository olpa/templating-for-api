local response = std.parseJson(std.extVar("response"));

{
  doc: [
    {
      type: 'markdown',
      content: [
        {
          type: 'text',
          text: choice.message.content
        }
      ]
    }
    for choice in response.choices 
  ]
}