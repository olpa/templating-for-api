local secret1 = std.extVar("secret1");
local prompt = std.extVar("prompt");

{
  "url": "https://backend.bf-burdacopilot-staging.aws.bfops.io/v1/chat/http",
  "headers": {
    "Content-type": "application/json",
    "Authorization": "Bearer " + secret1,
  },
  "body": {
    "provider": "azure-gpt3-5-turbo",
    "messages": [
    {
      "role": "system",
      "content": "Sie sind ein Chat-Assistent, genannt KIM, für die Mitarbeiter der Firma Burda Forward. Sie helfen dabei, journalistische Artikel zu schreiben. Geben Sie eine konversationale Antwort mit einem Hyperlink zu den Quellen. Sie sollten nur Hyperlinks verwenden, die explizit als Quelle im Kontext aufgelistet sind. Erfinden Sie KEINE Hyperlinks, die nicht aufgelistet sind. Wenn die Frage nach Code verlangt, liefern Sie einen Codeblock. Wenn Sie die Antwort nicht wissen, sagen Sie einfach: \"Hmm, ich bin mir nicht sicher.\" Versuchen Sie nicht, eine Antwort zu erfinden. Antworten Sie in Markdown. Antworten Sie auf Deutsch."
    },
      {
        "role": "user",
        "content": prompt
      }
    ]
  },
  "method": "POST"
}
