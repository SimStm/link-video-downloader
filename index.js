const puppeteer = require('puppeteer');
const _ = require('lodash');
const { downloadFileGot } = require('./util');

const mainUrlToNavigate = 'https://animesonlineup.com/o-incrivel-mundo-de-gumball-dublado-onlinesssssssss/'; // URL PRINCIPAL, ONDE ESTÃO OS LINKS DE CADA EPISÓDIO
const episodesQuerySelector = 'ul[class=episodios]>li>a'; // QUERY SELECTOR PARA ENCONTRAR OS LINKS (CUSTOMIZAR CONFORME A PÁGINA UTILIZADA)
const episodeLinkFileNameComparer = 'https://animesonlineup.com/episodio/'; // PARA DAR UM NOME PARA O ARQUIVO, USAMOS O CAMINHO DO LINK
const videoElementQuerySelector = 'video > source'; // QUERY SELECTOR PARA ENCONTRAR O ELEMENTO DE VIDEO/SOURCE CONTENDO O LINK
const downloadLinkStartsWithComparer = 'http://tudogostoso.blog'; // LINK DEVE COMEÇAR COM ESTE TEXTO. SERVE PARA USAR COMO COMPARATIVO E ENCONTRAR OS ARQUIVOS PARA BAIXAR.

const downloadFolder = './downloads'; // PASTA ONDE SALVARÁ OS ARQUIVOS BAIXADOS
const showDownloadProgress = true; // TRUE OU FALSE || TRUE CASO QUEIRA MOSTRAR O PROGRESSO DE DOWNLOAD DE CADA ARQUIVO, OU FALSE PARA NÃO MOSTRAR O PROGRESSO

(async () => {
  try {
    const browser = await puppeteer.launch();
    const [page] = await browser.pages();

    console.log(`==== Abrindo link: ${mainUrlToNavigate}`)
    //await page.goto(urlToNavigate);
    await page.goto(mainUrlToNavigate, { waitUntil: 'networkidle0' });

    console.log(`==== Analisando conteudo da pagina...\n`)
    const data = await page.evaluate(() => 
    {
      var linkList = [];

      // document.querySelector('*').outerHTML // // html full element
      let elements = document.querySelectorAll(episodesQuerySelector);
      for (let element of elements) {
        linkList.push(element.href);
      }

      return linkList;
    });

    console.log(`==== ${data.length} episodios encontrados! Separando links...\n`)

    for (let link of data) {
      process.stdout.write(`==== Procurando por episodio no link ${link}...`);
      //await page.goto(link);
      await page.goto(link, { waitUntil: 'networkidle0' });   
      
      process.stdout.write(`...`);
      const linkResult = await page.$$eval(videoElementQuerySelector, (nodes) => nodes.map((elem) => elem.src));
      let downloadLink = _.findLast(linkResult, (str) => _.startsWith(str, downloadLinkStartsWithComparer))
      process.stdout.write(`...`);

      if(downloadLink) {
        console.log(`[OK!]`)
        var linkFileName = link.replace(episodeLinkFileNameComparer, '').replace('/', '') + '.mp4';

        process.stdout.write(`==== Baixando arquivo como '${linkFileName}'...`);

        await downloadFileGot(linkFileName, downloadLink, downloadFolder, true, showDownloadProgress);
        console.log('');
      } else {
        console.log(`[NAO ENCONTRADO!]`)
      }
    }

    console.log('==== PROCESSO FINALIZADO!');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(0);
  }
})();