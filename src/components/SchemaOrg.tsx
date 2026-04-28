const SchemaOrg = ({ schema }: { schema: object | object[] }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
  />
);

export default SchemaOrg;
