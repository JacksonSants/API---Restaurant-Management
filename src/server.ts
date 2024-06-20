import fastify from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { createUser } from "./routes/users/register-user";
import { registerProduct } from "./routes/products/register-products";
import { registerItem } from "./routes/item/register-item";
import { registerAdress } from "./routes/endereco/register-address";
import { getUseradresses } from "./routes/endereco/get-address";
import { getProdutos } from "./routes/products/get-products";
import { getUser } from "./routes/users/get-users";
import { getItems } from "./routes/item/get-items";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createUser)
app.register(registerProduct)
app.register(registerItem)
app.register(registerAdress)
app.register(getUseradresses)
app.register(getProdutos)
app.register(getUser)
app.register(getItems)

app.listen({port: 3333}).then(() => {
    console.log('HTPP server running');
})