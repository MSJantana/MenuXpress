$(document).ready(function() {
    cardapio.eventos.init();
})

let cardapio = {};
let meu_carrinho = [];
let meu_endereco = null;
let valor_carrinho = 0;
let valor_entrega = 12;

cardapio.eventos = {

    init: () => {

        cardapio.metodos.obterItensCardapio();

    }

}

cardapio.metodos = {

    obterItensCardapio: (categoria = 'burgers', vermais = false) => {
        let filtro = MENU [categoria];
        
        if(!vermais) {
            $("#itensCardapio").html('');
            $("#btnVermais").removeClass('hidden');
        }
       

        $.each(filtro, (i,e) => {

            let temp = cardapio.templates.item.replace(/\${img}/g,e.img)
            .replace(/\${name}/g, e.name)
            .replace(/\${price}/g, e.price.toFixed(2).replace('.', ','))
            .replace(/\${id}/g, e.id)


            if(vermais && i >= 8 && i < 12){
                $("#itensCardapio").append(temp);

            }

            //paginação inicial

            if (!vermais && i < 8) {
                $("#itensCardapio").append(temp);
            }            
            
        })

        //remove o ativo
        $(".container-menu a").removeClass('active');

        //coloca ativo o botão novamente

        $("#menu-" + categoria).addClass('active');


    },

    verMais: ( ) => {
        
        let ativo = $(".container-menu a.active").attr('id').split('menu-')[1];

        cardapio.metodos.obterItensCardapio(ativo, true);

        $("#btnVermais").addClass('hidden');

    },

    //diminuir a quantidade do item cardapio
    diminuirQuantidade: (id) => { 

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if(qntdAtual > 0) {
            $("#qntd-" + id).text(qntdAtual - 1);
        }
    },

    //aumentar a quantidade do item cardapio
    aumentarQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());
        $("#qntd-" + id).text(qntdAtual + 1);

    },

    //adicionar ao carrinho o item do cardapio
    adicionarAoCarrinho: (id) => {
       // Obter a quantidade atual do item
        let qntdAtual = parseInt($("#qntd-" + id).text());

        if(qntdAtual > 0 ){
            //obter a categoria ativa
            let categoria = $(".container-menu a.active").attr('id').split('menu-')[1];
           
            //obter o lista de itens do cardapio
            let filtro = MENU[categoria];
           
            //obter o item do cardapio
            let item = $.grep(filtro, (e ,i) => { return e.id == id });
           
            if(item.length > 0){
                //validar se o item já existe no carrinho
                let existe = $.grep(meu_carrinho, (e, i) => { return e.id == id });
                if(existe.length > 0){
                    let objIndex = meu_carrinho.findIndex((obj => obj.id == id));
                    meu_carrinho[objIndex].qntd += qntdAtual;
                }else{
                    item[0].qntd = qntdAtual;
                    meu_carrinho.push(item[0]);
                }
                
                cardapio.metodos.mensagem('Item adicionado ao carrinho', 'green'); 
                $("#qntd-" + id).text(0);
                cardapio.metodos.atualizarBadgeCarrinho();
            }
        }  
    },
    
    //atualiza o bagde do totais dos botoes do carrinho
    atualizarBadgeCarrinho: () => {
        let total = 0;
        $.each(meu_carrinho, (i, e) => {
            total += e.qntd;
        })

        if(total > 0) {
            $(".btn-carrinho").removeClass('hidden');
            $(".container-total-carrinnho").removeClass('hidden');
        }
        else {
            $(".btn-carrinho").addClass('hidden');
            $(".container-total-carrinnho").addClass('hidden');
        }

        $(".badge-total-carrinho").html(total);
       
    },

    //abrir carrinho

    abrirCarrinho: (abrir) => {
        if(abrir){
            $("#modal-carrinho").removeClass('hidden');
            cardapio.metodos.carregarCarrinho();
        }else{
            $("#modal-carrinho").addClass('hidden');
        }
    },

    //carregar etapas do carrinho
    carregarEtapas: (etapa) => {

        const etapas = {
            1: {
                titulo: 'Seu Carrinho',
                mostrar: '#itensCarrinho',
                esconder: ['#localEntrega, #resumoCarrinho'],
                botoesAtivos:['#btnEtapaPedido'],
                botoesInativos: ['#btnEtapaEndereco', '#btnEtapaResumo', '#btnVoltar'], 
                etapas: ['.etapa1']
            },
            2:{
                titulo: 'Endereço de Entrega',
                mostrar: '#localEntrega',
                esconder: ['#itensCarrinho', '#resumoCarrinho'],
                botoesAtivos:['#btnEtapaEndereco', '#btnVoltar'],
                botoesInativos: ['#btnEtapaPedido', '#btnEtapaResumo'],
                etapas: ['.etapa1','.etapa2']
            },
            3: {
                titulo: 'Resumo do Pedido',
                mostrar: '#resumoCarrinho',
                esconder: ['#itensCarrinho', '#localEntrega'],
                botoesAtivos:['#btnEtapaResumo', '#btnVoltar'],
                botoesInativos: ['#btnEtapaPedido', '#btnEtapaEndereco'],
                etapas: ['.etapa1','.etapa2','.etapa3']
            }
        }

        const config = etapas [etapa];

        $("#lblTituloEtapa").text(config.titulo);

        $(config.mostrar).removeClass('hidden');
            config.esconder.forEach(selector => $(selector).addClass('hidden'));

        // Exibe os botões ativos e oculta os inativos
        config.botoesAtivos.forEach(selector => $(selector).removeClass('hidden'));
        config.botoesInativos.forEach(selector => $(selector).addClass('hidden'));

        //atualiza a classe active das etapas
         $(".etapa").removeClass('active');
            config.etapas.forEach(selector => $(selector).addClass('active'));

    }, 
    
     voltarEtapa:() => {
        let etapaAtual = $(".etapa.active").length ;
        if (etapaAtual > 1) {
            cardapio.metodos.carregarEtapas(etapaAtual - 1);
        }
     },     
     
     //carrega lista de itens do carrinho
     carregarCarrinho: () => {

        cardapio.metodos.carregarEtapas(1);

        if(meu_carrinho.length > 0 ){

            $("#itensCarrinho").html('');

            $.each(meu_carrinho, (i, e) => {
                let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img)
                .replace(/\${name}/g, e.name)
                .replace(/\${price}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${id}/g, e.id)
                .replace(/\${qntd}/g, e.qntd);

                $("#itensCarrinho").append(temp);

                //ultimo item
                if((i + 1) == meu_carrinho.length){
                    cardapio.metodos.carregarValores();
                }
            })            

        }
        else {
            $("#itensCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu Carrinho está Vazio</p>');
            cardapio.metodos.carregarValores();           
        }

     },

     //diminuir a quantidade do item do carrinho

     diminuirQuantidadeCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());

        if(qntdAtual > 1) {
            $("#qntd-carrinho-" + id).text(qntdAtual - 1);
            cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
        }else {
            cardapio.metodos.removerItemCarrinho(id);
        }

     },

     //aumentar a quantidade do item do carrinho

     aumentarQuantidadeCarrinho: (id) => {
        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
        $("#qntd-carrinho-" + id).text(qntdAtual + 1);
        cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);

     },

     removerItemCarrinho: (id) => {

        meu_carrinho = $.grep(meu_carrinho, (e, i) => { return e.id != id });
        cardapio.metodos.carregarCarrinho();
        cardapio.metodos.atualizarBadgeCarrinho();

     },

     //atualiza o carrinho com a quantidade total
     atualizarCarrinho: (id, qntd) => {
        let objIndex = meu_carrinho.findIndex((obj) => obj.id === id);
        meu_carrinho[objIndex].qntd = qntd;

        cardapio.metodos.atualizarBadgeCarrinho();

        cardapio.metodos.carregarValores();

     },

     //carregar valores de subtotal, entrega e local

     carregarValores: () => {

        valor_carrinho = 0;

        $("#lblSubTotal").text('R$ 0,00');
        $("#lblValorEntrega").text('R$ 0,00');
        $("#lblValorTotal").text('R$ 0,00');

         // Verifica se o carrinho está vazio
        if (meu_carrinho.length === 0) {
        $("#lblValorEntrega").text('R$ 0,00'); // Sem entrega para carrinho vazio
        
        return; // Sai da função, já que não há itens no carrinho
    }
        //Calcula o valor do carrinho
        $.each(meu_carrinho, (i, e) => {
            valor_carrinho += parseFloat(e.price * e.qntd);           

        });
        // Atualiz o valores na DOM
        $("#lblSubTotal").text('R$ ' + valor_carrinho.toFixed(2).replace('.', ','));

        if(valor_carrinho > 250) {
            //Entrega GRÁTIS
            $("#lblValorEntrega").text('Entrega Grátis');
            $("#lblValorTotal").text('R$ ' + valor_carrinho.toFixed(2).replace('.', ','));

        }else {
            // Cobrar entrega
            $("#lblValorEntrega").text('R$ ' + valor_entrega.toFixed(2).replace('.', ','));
            const total  = valor_carrinho + valor_entrega;
            $("#lblValorTotal").text('R$'+ total.toFixed(2).replace('.', ','));           
        }

     },

     carregarEndereco: () => {
        if(meu_carrinho.length <= 0) {
            cardapio.metodos.mensagem('Seu carrinho está vazio.')
            return;
        }

        cardapio.metodos.carregarEtapas(2);

     },
     //API ViaCep
     buscarCep: () => {
        try {
            // Obtém o valor do campo de CEP
            let cep = $("#txtCEP").val()?.trim().replace(/\D/g, '');
    
            if (!cep) {
                cardapio.metodos.mensagem('Por favor, preencha o CEP corretamente.');
                $("#txtCEP").focus();
                return;
            }
    
            // Validação de formato do CEP
            let validaCep = /^\d{8}$/;
    
            if (!validaCep.test(cep)) {
                cardapio.metodos.mensagem('CEP inválido.');
                $("#txtCEP").focus();
                return;
            }
    
            // Chamada à API do ViaCEP
            $.getJSON(`https://viacep.com.br/ws/${cep}/json/?callback=?`, (data) => {
                if (data && !("erro" in data)) {
                    // Preenche os campos do formulário com os dados recebidos
                    $("#txtEndereco").val(data.logradouro || '');
                    $("#txtBairro").val(data.bairro || '');
                    $("#txtCidade").val(data.localidade || '');
                    $("#ddlUF").val(data.uf || '');
                    $("#txtNumero").focus();
                } else {
                    cardapio.metodos.mensagem('CEP não encontrado.');
                    $("#txtCEP").focus();
                }
            }).fail(() => {
                cardapio.metodos.mensagem('Erro ao buscar o CEP. Tente novamente mais tarde.');
                $("#txtCEP").focus();
            });
        } catch (error) {
            console.error("Erro no método buscarCep:", error);
            cardapio.metodos.mensagem('Ocorreu um erro inesperado.');
        }
               
     },

    //refatorar esse código acima

    resumoPedido: () => {
        try {
            // Obtém os valores dos campos do formulário
            const campos = {
                cep: $("#txtCEP").val()?.trim(),
                endereco: $("#txtEndereco").val()?.trim(),
                bairro: $("#txtBairro").val()?.trim(),
                cidade: $("#txtCidade").val()?.trim(),
                uf: $("#ddlUF").val()?.trim(),
                numero: $("#txtNumero").val()?.trim(),
                complemento: $("#txtComplemento").val()?.trim(),
            };
        
            console.log("Campos capturados:", campos);
        
            // Campos obrigatórios e suas mensagens de validação
            const validacoes = [
                { campo: "cep", mensagem: "Por favor, preencha o CEP corretamente.", seletor: "#txtCEP" },
                { campo: "endereco", mensagem: "Por favor, preencha o endereço corretamente.", seletor: "#txtEndereco" },
                { campo: "bairro", mensagem: "Por favor, preencha o bairro corretamente.", seletor: "#txtBairro" },
                { campo: "cidade", mensagem: "Por favor, preencha a cidade corretamente.", seletor: "#txtCidade" },
                { campo: "uf", mensagem: "Por favor, selecione a UF corretamente.", seletor: "#ddlUF", condicao: (valor) => valor !== "-1" },
                { campo: "numero", mensagem: "Por favor, preencha o número corretamente.", seletor: "#txtNumero" },
            ];
        
            // Valida os campos
            for (const { campo, mensagem, seletor, condicao } of validacoes) {
                const valor = campos[campo];
                if (!valor || (condicao && !condicao(valor))) {
                    console.warn(`Campo inválido: ${campo}, valor: ${valor}`);
                    cardapio.metodos.mensagem(mensagem);
                    $(seletor).focus();
                    return; // Interrompe o fluxo se algum campo for inválido
                }
            }
        
            // Cria e armazena o objeto de endereço
            const meu_endereco = { ...campos }; // Inclui todos os campos capturados
            // Certifique-se de que cardapio.dados está inicializado
            if (!cardapio.dados) {
                cardapio.dados = {}; // Inicializa cardapio.dados caso não exista
            }
            cardapio.dados.meu_endereco = meu_endereco;
        
            console.log("Endereço preenchido e armazenado:", meu_endereco);
        
            // Prossiga para a próxima etapa
            cardapio.metodos.carregarEtapas(3);
        
            // Carrega o resumo (certifique-se de que este método está funcional e recebe os dados corretamente)
            cardapio.metodos.carregarResumo();
        
        } catch (error) {
            console.error("Erro no método resumoPedido:", error);
            cardapio.metodos.mensagem("Ocorreu um erro inesperado ao processar o resumo do pedido.");
        }

    }, 

    carregarResumo: () => {

        $("#listaItensResumo").html('');

        $.each(meu_carrinho, (i, e) => {
            let temp = cardapio.templates.itemResumo.replace(/\${img}/g, e.img)
            .replace(/\${name}/g, e.name)
            .replace(/\${price}/g, e.price.toFixed(2).replace('.', ','))
            .replace(/\${qntd}/g, e.qntd);

            $("#listaItensResumo").append(temp);
            
        });

        if (cardapio.dados.meu_endereco) {
            const endereco = cardapio.dados.meu_endereco;
            const enderecoCompleto = `${endereco.endereco}, ${endereco.numero} - ${endereco.bairro} <br> ${endereco.cidade} - ${endereco.uf}, CEP: ${endereco.cep}`;
            const complemento = endereco.complemento ? ` - ${endereco.complemento}` : '';
    
            $("#resumoEndereco").html(`${enderecoCompleto}${complemento}`);
        } else {
            $("#resumoEndereco").html('Endereço não informado');
        }
        cardapio.metodos.finalizarPedido();
    },
    //atualiza o link do pedido
    finalizarPedido: () => {
    // Gera um ID de pedido aleatório
    const idPedido = Math.floor(Math.random() * 999999);

    // Verifica se há itens no carrinho e se o endereço foi fornecido
    if (meu_carrinho.length > 0 && cardapio.dados.meu_endereco) {
        // Garante que os valores estão atualizados
        cardapio.metodos.carregarValores();

        let itens = '';

        // Itera pelos itens do carrinho para montar a lista de produtos
        $.each(meu_carrinho, (i, e) => {
            itens += `${e.qntd}x ${e.name} - R$ ${e.price.toFixed(2).replace('.', ',')}\n`;
        });

        // Recupera os valores calculados
        const valorEntrega = valor_carrinho > 250 ? 0 : valor_entrega; // Entrega grátis se o carrinho for maior que R$ 250
        const valorTotalComEntrega = valor_carrinho + valorEntrega;

        // Monta o texto completo do pedido
        let texto = 'Seu pedido foi realizado com sucesso!\n';
            texto += `*Número do Pedido:* ${idPedido}\n`;
            texto += `*Itens do Pedido:* \n${itens}`;
            texto += `\n*Endereço de Entrega:*`;
            texto += `\n${cardapio.dados.meu_endereco.endereco}, ${cardapio.dados.meu_endereco.numero} - ${cardapio.dados.meu_endereco.bairro}`;
            texto += `\n${cardapio.dados.meu_endereco.cidade} - ${cardapio.dados.meu_endereco.uf}, CEP: ${cardapio.dados.meu_endereco.cep}`;
            texto += `\n*Valor da Entrega:* R$ ${valorEntrega.toFixed(2).replace('.', ',')}`;
            texto += `\n*Valor Total:* R$ ${valorTotalComEntrega.toFixed(2).replace('.', ',')}`;

        // Exibe a mensagem de sucesso
            cardapio.metodos.mensagem('Seu pedido foi realizado com sucesso!', 'green');

            // Exibe o texto completo no console (ou pode ser enviado para outro sistema)
            console.log(texto);

        // Aqui você pode adicionar a lógica para redirecionar, salvar ou exibir o resumo do pedido.
    } else {
        // Caso o carrinho esteja vazio ou o endereço não esteja configurado
        cardapio.metodos.mensagem('Erro ao finalizar o pedido: Verifique o carrinho e o endereço.', 'red');
    }
    },

    //mensagens de adicionar itens
    mensagem: (texto, cor = 'red' ,  tempo = 3500) => {

        let id = Math.floor(Date.now() * Math.random().toString());

        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}"> ${texto} </div>`
        $(".container-mensagens").append(msg);

        setTimeout(() => {
            $("#msg-" + id).removeClass('fadeInDown');
            $("#msg-" + id).addClass('fadeOutUp');
            setTimeout(() => {
                $("#msg-" + id).remove();
            },800);
        }, tempo)
    },
    
}

cardapio.templates = {

    item: `
        <div class="col-3  mb-5">
            <div class="card card-item" id="\${id}">
                <div class="img-produto">
                    <img src="\${img}" />
                </div>
                <p class="title-produto text-center mt-4">
                    <b>\${name}</b>
                </p>
                <p class="price-produto text-center">
                    <b>R$ \${price}</b>
                </p>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="qntd-\${id}">0</span>
                    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fas fa-shopping-bag"></i></span>
                
                </div>
                                         
             </div>
        </div>
        ` ,
        
        itemCarrinho: `
        <div class="col-12 item-carrinho">

            <div class="img-produto">
                <img src="\${img}" alt="burger">
            </div>
            <div class="dados-produto">
                <p class="title-produto">
                    <b>\${name}</b>
                </p>
                <p class="price-produto">
                    <b>\${price}</b>
                </p>                             

            </div>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-remove" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fas fa-times"></i></span>
                    
            </div>

         </div>        
        
        `,

        itemResumo: `

        <div class="col-12 item-carrinho resumo">
            <div class="img-produto-resumo">
                <img src="\${img}" alt="burger">
            </div>
        <div class="dados-produto">
            <p class="title-produto-resumo">
                <b>\${name}</b>
            </p>
            <p class="price-produto-resumo">
                <b>\${price}</b>
            </p>
        </div>
            <p class="quantidade-produto-resumo">
                x <b>\${qntd}</b>
            </p>
        </div>

        `
}