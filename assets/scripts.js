const baseUrl = 'http://localhost:3000/api/total'

//Obtener datos de COVID-19 de la API
const getCovidTotal = async (url) => {
    try {
        const response = await fetch(url)
        const { data } = await response.json();
        //Control de registros accesados
//        console.log(data)  //CAMBIÉ VARIABLE DATA POR data, PORQUE CHARTJS UTILIZA UNA VARIABLE LLAMADA DATA
//        console.log(data[0].location)
//        console.log(data[0].confirmed)
        if (data) {
            //Lamada a la función gráfica
            covidGraph(data)
        }
        return data
    }
    catch (error) {
        console.log(`Se ha producido un error en getCovidTotal [catch]: ${error}`)
    }
}

// Obtener datos por pais =  http://localhost:3000/api/countries/${country}
const getApiPais = async(country) => {
    try {
        const response = await fetch(`http://localhost:3000/api/countries/${country}`)
        const { data } = await response.json();

//      console.log(`Datos pais : ${data}`)
//      console.log(data)  //CAMBIÉ VARIABLE DATA POR data, PORQUE CHARTJS UTILIZA UNA VARIABLE LLAMADA DATA

        if (data) {
            chartPais(data)
        }
        return data
    } 
    catch (err) {
        console.error(`Error datos pais : ${err}`)
    }
}

// Casos - definiendo instancias
// Nivel mundial
let activosCovid     = []
let confirmadosCovid = []
let muertesCovid     = []
let recuperadosCovid = []
// Nivel pais
let activosPais      = []
let confirmadosPais  = []
let muertesPais      = []
let recuperadosPais  = []

const covidGraph = (data) => {
    //Variable
    let dataBackground = data

    //Cálculo de cantidad de sobrevivientes, recuperados (70% de sobrevivientes) y casos activos (30% de sobrevivientes)
    dataBackground.map(tmpRecup => {
        let survivors = tmpRecup.confirmed - tmpRecup.deaths
        tmpRecup.recovered = survivors * 0.70
        tmpRecup.active    = survivors * 0.30
        return tmpRecup
    })

    //Confirmación de adquisición de datos OK
//    console.log(`Location : ${dataBackground[10].location}`)
//    console.log(`Confirmed: ${dataBackground[10].confirmed}`)
//    console.log(`Deaths   : ${dataBackground[10].deaths}`)
//    console.log(`Recovered: ${dataBackground[10].recovered}`)
//    console.log(`Active   : ${dataBackground[10].active}`)

    //Filtro de activos a graficar (>10.000)
    let dataFilter = dataBackground.filter((searchingData) => {
        return searchingData.active > 2000000   // <------------ Originalmente se esta pidiendo mayores a 10.000.
                                                //               Este valor se debe DISMINUIR para ampliar el grafico.
                                                //               Los valores de los CONFIRMADOS son muy elevados,
                                                //               y si este valor se reduce, las barras de las otras
                                                //               variables se disminuyes y algunas no se ven.
                                            })

    //Confirmación de aplicación de filtro OK
//    console.log(`Location : ${dataFilter[10].location}`)
//    console.log(`Confirmed: ${dataFilter[10].confirmed}`)
//    console.log(`Deaths   : ${dataFilter[10].deaths}`)
//    console.log(`Recovered: ${dataFilter[10].recovered}`)
//    console.log(`Active   : ${dataFilter[10].active}`)

    dataFilter.forEach((k) => {
        activosCovid.push({
            label: k.location,
            y    : k.active,
        });
        confirmadosCovid.push({
            label: k.location,
            y    : k.confirmed,
        });
        muertesCovid.push({
            label: k.location,
            y    : k.deaths
        })
        recuperadosCovid.push({
            label: k.location,
            y    : k.recovered
        })
    });

//    console.log(confirmadosCovid)
//    console.log(muertesCovid)

    let config = {
        animationEnabled: true,
        exportEnabled   : true,
        theme           : "dark1",
        backgroundColor : "#F4F6F7",
        title: {
            text      : "Paises con Covid-19",
            fontFamily: 'Open Sans',
            fontWeight: "normal",
            fontColor : "#17202A",
        },
        axisX: {
            title         : "",
            labelAngle    : -45,
            interval      : 1,
            labelFontColor: "#17202A",
        },
        axisY: {
            title         : "",
            titleFontColor: "#a3a3a3",
            lineColor     : "#a3a3a3",
            labelFontColor: "#17202A",
            tickColor     : "#a3a3a3",
            gridThickness : 1
        },

        legend: {
            cursor         : "pointer",
            horizontalAlign: "center",
            fontColor      : "#17202A",
        },
        dataPointWidth: 15,
        height        : 350,

        data: [
            {
                type: "column",
                name: "total activos",
                legendText  : "Casos activos",
                showInLegend: true,
                dataPoints  : activosCovid
            },
            {
                type: "column",
                name: "total confirmados",
                legendText  : "Casos confirmados",
                axisYType   : "secondary",
                showInLegend: true,
                dataPoints  : confirmadosCovid
            },
            {
                type: "column",
                name: "total muertos",
                legendText  : "Casos muertos",
                axisYType   : "secondary",
                showInLegend: true,
                dataPoints  : muertesCovid
            },
            {
                type: "column",
                name: "total recuperados",
                legendText  : "Casos recuperados",
                axisYType   : "secondary",
                showInLegend: true,
                dataPoints  : recuperadosCovid
            }
        ]
    };
    let chart = new CanvasJS.Chart("covidGraph", config)
    chart.render()

    // grafico pais
    function datoTabla(filtroPais) {
        let texto = "<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><tr><th>Paises</th><th>Confirmados</th><th>Muertos</th><th>Gráfico</th></tr>"
        for (let i = 0; i < filtroPais.length; i++) {
            texto += `<tr>
                    <td>${filtroPais[i].location}</td>
                    <td>${filtroPais[i].confirmed}</td>
                    <td>${filtroPais[i].deaths}</td>
                    <td><button type="button" class="btnCountry btn btn-outline-success" data-toggle="modal" data-target="#chartPais" value="${filtroPais[i].location}">ver detalle</button></td>
                    </tr>`
        }
        document.querySelector("#tabla-covid").innerHTML = texto
    }

    datoTabla(dataBackground)
    $(".btnCountry").click(function() {
        activosPais     = []
        confirmadosPais = []
        muertosPais     = []
        recuperadosPais = []
        const pais      = $(this).val()
        var pais2       = pais.split(' ').join('_')
        // habilitar ventana modal
        window.modal = ($('#chartPais').modal('show'))
        
        getApiPais(pais2)
    })
}
// grafico pais (Boton HTML)
const chartPais = (data) => {
    let paisData = data

    console.log(`Datos X pais : ${paisData}`)

    console.log(paisData.location)
    console.log(paisData.confirmed)
    console.log(paisData.deaths)
    console.log(paisData.recovered)
    console.log(paisData.active)


    //Cálculo de cantidad de sobrevivientes, recuperados (70% de sobrevivientes) y casos activos (30% de sobrevivientes)
    let survivors2 = paisData.confirmed - paisData.deaths
    paisData.recovered = survivors2 * 0.70
    paisData.active    = survivors2 * 0.30

    console.log(paisData.location)
    console.log(paisData.confirmed)
    console.log(paisData.deaths)
    console.log(paisData.recovered)
    console.log(paisData.active)

    activosPais.push({
        label: paisData.location,
        y    : paisData.active
    });
    confirmadosPais.push({
        label: paisData.location,
        y    : paisData.confirmed
    });
    muertosPais.push({
        label: paisData.location,
        y    : paisData.deaths
    });
    recuperadosPais.push({
        label: paisData.location,
        y    : paisData.recovered
    })

    console.log(activosPais)
    console.log(confirmadosPais)
    console.log(muertosPais)
    console.log(recuperadosPais)

    let configPais = {
        animationEnabled: true,
        theme : "light1",
        title : {
                text : "Casos : " + paisData.location
                },
        axisX : {
                labelAngle: 0,
                interval  : 1
                },
        axisY : {
            title         : "Activos",
            titleFontColor: "#000",
            lineColor     : "#000",
            labelFontColor: "#000",
            tickColor     : "#000"
        },
        axisY2: {
            title         : "Confirmados",
            titleFontColor: "#000",
            lineColor     : "#000",
            labelFontColor: "#000",
            tickColor     : "#000"
        },
        axisY2: {
            title         : "Muertes",
            titleFontColor: "#000",
            lineColor     : "#000",
            labelFontColor: "#000",
            tickColor     : "#000"
        },
        axisY2: {
            title         : "Recuperados",
            titleFontColor: "#000",
            lineColor     : "#000",
            labelFontColor: "#000",
            tickColor     : "#000"
        },

        dataPointWidth: 50,
        height: 200,
        data: [
            {
                type: "column",
                name: "total activos",
                legendText  : "Casos activos",
                showInLegend: true,
                dataPoints  : activosPais
            },
            {
                type: "column",
                name: "total confirmados",
                legendText  : "Casos confirmados",
                axisYType   : "secondary",
                showInLegend: true,
                dataPoints  : confirmadosPais
            },
            {
                type: "column",
                name: "total muertos",
                legendText  : "Casos muertos",
                axisYType   : "secondary",
                showInLegend: true,
                dataPoints  : muertosPais
            },
            {
                type: "column",
                name: "total recuperados",
                legendText  : "Casos recuperados",
                axisYType   : "secondary",
                showInLegend: true,
                dataPoints  : recuperadosPais
            }
        ]
    };
    let chart = new CanvasJS.Chart("covidChartPais", configPais)
    chart.render()
}

getCovidTotal(baseUrl)