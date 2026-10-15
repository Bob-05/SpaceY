const http = require('http');

const PORT = 3000;


const server = http.createServer((req, res) => {
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  

    res.end(
     "ГБПОУ РО «РКСИ» \nСтудент: Азизов Бахтияр\nГруппа: ИС-43"
  );

});

server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
