
//**************** Classe Principal *******************
class CaixaDaLanchonete {

    cardapio = new Cardapio();

    calcularValorDaCompra(metodoDePagamento, itens) {
        try {
            let carrinho = new Carrinho(itens);
            let validaCompra = new ValidaCompra();

            /*Chamando o método de validação da compra para testar algum possível erro no carrinho ou 
            no método de pagamento antes de passá-los para os cáculos*/
            validaCompra.validarCompra(metodoDePagamento, carrinho);

            let soma = 0.0;
            //Se não houver erros, entra nesse FOR
            for (let i in carrinho.itensCarrinho) {
                let itemCarrinho = carrinho.itensCarrinho[i];
                /*Passando o código do produto do carrinho para um itemCardapio para acessar seu preço 
                no dicionário*/
                let itemCardapio = this.cardapio.getItemByCodigo(itemCarrinho.codigo);
                /*Os itens no carrinhos são passados como string, sendo necessário transformá-los em
                number para fazer cáculos matemáticos*/
                soma += parseInt(itemCarrinho.quantidade) * parseFloat(itemCardapio.preco);
            }

            //Verificando forma de pagamento para atribuir desconto ou taxa no valor da compra
            if (metodoDePagamento == 'dinheiro') {
                soma -= soma * 0.05;
            }
            else if (metodoDePagamento == 'credito') {
                soma += soma * 0.03;
            }

            //Fixando as casas decimais em duas
            soma = parseFloat(soma.toFixed(2));
            //Retornando o valor total da compra com a formatação da moeda brasileira
            return soma.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        }
        //Se houver erros na validação da compra, entra no catch e retorna a mensagem adequada
        catch (e) {
            return e.message;
        }
    }

}

//**************** Classes de Validação da compra *******************
class ValidaCompra {

    validarCompra(formaDePagamento, carrinho) {
        let cardapio = new Cardapio();

        let eFormaDePagamentoInvalida = 
            formaDePagamento != 'dinheiro' && formaDePagamento != 'debito' && formaDePagamento != 'credito';
        if (eFormaDePagamentoInvalida) {
            throw new Error("Forma de pagamento inválida!");
        }
        if (carrinho.itensCarrinho.length === 0) {
            throw new Error("Não há itens no carrinho de compra!");
        }
        /*Como o método retorna false em caso de erro, é necessário a ! para mudar 
        seu valor lógico e entrar na condição*/
        let eItemInvalido = this.verificarItemValido(cardapio, carrinho.itensCarrinho);
        if (!eItemInvalido) {
            throw new Error("Item inválido!");
        }
        if (!this.verificarQuantidadeCarrinho(carrinho.itensCarrinho)) {
            throw new Error ("Quantidade inválida!");
        }
        if (!this.verificarItemExtraSemPrincipal(cardapio, carrinho.itensCarrinho)) {
            throw new Error("Item extra não pode ser pedido sem o principal");
        }
        return true;
    }

    //Verificando se há item extra sozinho ou sem seu respectivo principal
    verificarItemExtraSemPrincipal(cardapio, itensCarrinho) {
        let retorno = true;
        for (let i in itensCarrinho) {
            let itemCarrinho = itensCarrinho[i];
            /*Passando o código do produto do carrinho para um itemCardapio para acessar o principal 
            associado ao item extra no dicionário*/
            let itemCardapio = cardapio.cardapioDict.get(itemCarrinho.codigo);
            //Procurando se tem item extra no carrinho
            if (itemCardapio.eExtra) {
                retorno = false;
                /*Caso seja encontrado um item extra no carrinho, entra no FOR para vasculhar seu o 
                seu principal foi adicionado também*/
                for (let j in itensCarrinho) {
                    let itemCarrinhoAux = itensCarrinho[j];
                    //Verificando se o item analisado é o principal do extra
                    if (itemCarrinhoAux.codigo == itemCardapio.principal) {
                        retorno = true;
                    }
                }
            }
        }
        return retorno;
    }

    //Verificando se existe no cardápio o código do produto introduzido no carrinho 
    verificarItemValido(cardapio, itensCarrinho) {
        for (let i in itensCarrinho) {
            let itemCarrinho = itensCarrinho[i];
            if (!cardapio.cardapioDict.has(itemCarrinho.codigo)) {
                return false;
            }
        }
        return true;
    }

    //Verificando para cada item do carrinho se sua quantidade no pedido é igual a zero
    verificarQuantidadeCarrinho(itensCarrinho) {
        for (let i in itensCarrinho) {
            let itemCarrinho = itensCarrinho[i];
            if (itemCarrinho.quantidade == '0') {
                return false;
            }
        }
        return true;
    }
}

//**************** Classes do Cardápio da lanchonete *******************
class Cardapio {
    
    constructor() {
        //Usando um dicionário para armazenar todas as informações dos itens do Cardápio
        this.cardapioDict = new Map([
            ["cafe", new ItemCardapio("cafe", 3.00, false, null)],
            ["chantily", new ItemCardapio("chantily", 1.50, true, "cafe")],
            ["suco", new ItemCardapio("suco", 6.20, false, null)],
            ["sanduiche", new ItemCardapio("sanduiche", 6.50, false, null)],
            ["queijo", new ItemCardapio("queijo", 2.00, true, "sanduiche")],
            ["salgado", new ItemCardapio("salgado", 7.25, false, null)],
            ["combo1", new ItemCardapio("combo1", 9.50, false, null)],
            ["combo2", new ItemCardapio("combo2", 7.50, false, null)],
        ]);
    }

    //Método para acessar facilmente um item do cardapio pelo seu código
    getItemByCodigo (codigo) {
        return this.cardapioDict.get(codigo);
    }
}

class ItemCardapio {

    constructor(codigo, preco, eExtra, principal) {
        this.codigo = codigo; //String
        this.preco = preco; //Number - Float
        this.eExtra = eExtra; //Boolean para retornar se é um item extra (true) ou não (false)
        this.principal = principal; //String especificando qual o principal associado ao extra
    }
}

//**************** Classes do Carrinho de compras *******************
class Carrinho {

    constructor(itens) {
        this.itensCarrinho = [];

        for (let i in itens) {
            //Quebrando o parâmetro recebido itens, que é uma Array de String, em duas partes: código e quantidade
            let itemSplit = itens[i].split(',');
            //Adicionando as partes quebradas em um novo array, itensCarrinho
            this.itensCarrinho.push(new ItemCarrinho(itemSplit[0], itemSplit[1]));
        }
    }
}

class ItemCarrinho {

    constructor(codigo, quantidade) {
        this.codigo = codigo;
        this.quantidade = quantidade
    }
}

export { CaixaDaLanchonete };
