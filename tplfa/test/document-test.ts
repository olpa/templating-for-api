import fs from 'fs';
import chai from 'chai';
import Ajv, { JSONSchemaType } from 'ajv';
import { TplfaDocument, TplfaMarkdownNode, TplfaTextNode } from '../lib/types';

const ajv = new Ajv();

describe('Request', () => {
  const schema = JSON.parse(
    fs.readFileSync(`${__dirname}/../schemas/document.json`, 'utf8')
  ) as JSONSchemaType<TplfaDocument>;
  const validate = ajv.compile(schema);

  it('happy path', () => {
    const validTextNode: TplfaTextNode = { type: 'text', text: 'Hello, world!' };
    const validMdNode: TplfaMarkdownNode = { type: 'markdown', content: [validTextNode] };
    const validDoc: TplfaDocument = { doc: [validMdNode] };

    const isValid = validate(validDoc);

    chai.expect(validate.errors).to.eql(null);
    chai.expect(isValid).to.be.true;
  });

  it('empty document is ok', () => {
    const emptyDoc: TplfaDocument = { doc: [] };

    const isValid = validate(emptyDoc);

    chai.expect(validate.errors).to.eql(null);
    chai.expect(isValid).to.be.true;
  });

  it('reject unknown node type', () => {
    const invalidNode = { type: 'invalid' as 'markdown', content: [] };
    const invalidDoc: TplfaDocument = { doc: [invalidNode] };

    const isValid = validate(invalidDoc);

    chai.expect(isValid).to.be.false;
    chai.expect(validate.errors?.map(e => e.message)).to.eql(
      ['must be equal to constant']
    );
  });
});
