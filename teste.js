const customer = {
  balance:[1500,1500,-500]
}
const valores = customer.balance
var soma = 0;
for (let i = 0; i < valores.length; i++) {
  soma += valores[i];
}
console.log(soma)

