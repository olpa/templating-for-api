import fs from 'fs';
import chai from 'chai';
import Ajv, { JSONSchemaType } from 'ajv';
import { TplfaRequest } from '../lib/types';

const ajv = new Ajv();

describe('Request', () => {
  const schema = JSON.parse(
    fs.readFileSync(`${__dirname}/../schemas/request.json`, 'utf8')
  ) as JSONSchemaType<TplfaRequest>;
  const validate = ajv.compile(schema);

  const validRequest: TplfaRequest = {
    url: 'https://example.com',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { foo: 'bar' },
  };

  it('happy path', () => {
    const isValid = validate(validRequest);

    chai.expect(validate.errors).to.eql(null);
    chai.expect(isValid).to.be.true;
  });

  const required: Array<keyof TplfaRequest> = ['url', 'method', 'body'];
  required.forEach((prop) => {
    it(`missing ${prop}`, () => {
      const invalid = { ...validRequest };
      delete invalid[prop];

      const isValid = validate(invalid);

      chai.expect(isValid).to.be.false;
      chai.expect(validate.errors?.map(e => e.message)).to.eql(
        [`must have required property '${prop}'`]
      );
    });
  });
});
