import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { componentPropsSchemas } from "@repo/domain";

export const catalog = defineCatalog(schema, {
  components: {
    Stack: {
      props: componentPropsSchemas.Stack,
      slots: ["default"],
    },
    Grid: {
      props: componentPropsSchemas.Grid,
      slots: ["default"],
    },
    Heading: { props: componentPropsSchemas.Heading },
    Text: { props: componentPropsSchemas.Text },
    Card: {
      props: componentPropsSchemas.Card,
      slots: ["default", "header", "footer"],
    },
    Button: { props: componentPropsSchemas.Button },
    List: { props: componentPropsSchemas.List },
    Table: { props: componentPropsSchemas.Table },
  },
  actions: {},
});
