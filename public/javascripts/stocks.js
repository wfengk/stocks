var app = angular.module('stocksApp', ["agGrid",'ngMaterial', 'ngMessages']);

agGrid.initialiseAgGridWithAngular1(angular);

app.factory('stocks', ['$http',function($http){

  var getStocks = function(dateFilter) {
    return $http({
      method: 'GET',
      url: 'api/stocks',
      params: { "date" : dateFilter }
    })
  };

  return {
    getStocks: getStocks
  }
}]);

app.controller('MainCtrl', ['$scope', 'stocks', function($scope, stocks){

    /*
        Data grid column configuration
    */
    var columnDefs = [
        {headerName: '', width: 30, checkboxSelection: true, sortable: false,
            suppressMenu: true, pinned: true},
        {
            headerName: 'Stock',
            children: [
                { headerName: "Symbol", field: "symbol", width: 150, pinned: true },
                { headerName: "Company", field: "price.longName", width: 400, pinned: true },
                { headerName: "Price", field: "financialData.currentPrice.raw", filter: 'agNumberColumnFilter', width: 150, cellRenderer: boldCellRenderer},
            ]
        },
        {
            headerName: 'Key Statistics',
            children: [
                { headerName: "P/E Ratio", filter: 'agNumberColumnFilter', width: 150, valueGetter: peRatioCalculation, cellRenderer: peRatioCellRenderer}, 
                { headerName: "P/B Ratio", field: "defaultKeyStatistics.priceToBook.raw", filter: 'agNumberColumnFilter', width: 150, cellRenderer: pbRatioCellRenderer}, 
                { headerName: "Return on Equity", field: "financialData.returnOnEquity.raw", filter: 'agNumberColumnFilter', width: 200, cellRenderer: percentCellRenderer, cellRendererParams: {conversionRequired: true}},
                { headerName: "Yield", field: "summaryDetail.dividendYield.raw", filter: 'agNumberColumnFilter', width: 150, cellRenderer: percentCellRenderer, cellRendererParams: {conversionRequired: true}},
                { headerName: "Yield (5 Yr Avg)", field: "summaryDetail.fiveYearAvgDividendYield.raw", filter: 'agNumberColumnFilter', width: 150, cellRenderer: percentCellRenderer, cellRendererParams:{conversionRequired: false}},
                { headerName: "Graham Number", field: "grahamNumber", filter: 'agNumberColumnFilter', valueGetter: gramhamNumberCalculation, cellRenderer: grahamNumberCellRenderer},
                { headerName: "Debt to Equity", field: "financialData.debtToEquity.raw", filter: 'agNumberColumnFilter'}
            ]
        },
        {
            headerName: 'Statistics',
            children: [
                { headerName: "Daily Change" , field: "price.regularMarketChangePercent.raw", filter: 'agNumberColumnFilter', width: 150, cellRenderer: percentCellRenderer, cellRendererParams: {conversionRequired: true}},
                { headerName: "Exchange", field: "quoteType.exchange", filter: 'agTextColumnFilter', width: 150},
                { headerName: "Industry", field: "summaryProfile.industry", filter: 'agTextColumnFilter', width: 150},
                { headerName: "Market Cap", field: "price.marketCap.fmt", filter: 'agTextColumnFilter', width: 150},
                { headerName: "Asset Type", field: "quoteType.quoteType", filter: 'agTextColumnFilter', width: 150},
                { headerName: "Trailing EPS", field: "defaultKeyStatistics.trailingEps.raw", filter: 'agNumberColumnFilter', width: 150},
                { headerName: "Forward EPS", field: "defaultKeyStatistics.forwardEps.raw", filter: 'agNumberColumnFilter', width: 150}
            ]
        }
    ];

    $scope.numResults = 0;

    /*
        Data grid configuration
    */
    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowSelection: 'multiple',
        rowData: [],
        suppressRowClickSelection: true,
        defaultColDef: {
            sortable: true,
            filter: true,
            resize: true
        }
    };

    /*
        Query MongoDB for data then load the data grid
    */
    stocks.getStocks(new Date()).then(function(response) {
        console.log("Done querying for data - initial load");
        $scope.gridOptions.api.setRowData(response.data);
        $scope.numResults = response.data.length;
    });

    $scope.updateResults = function() {
        stocks.getStocks($scope.chosenDate).then(function(response) {
            console.log("Done querying for data - using specified date");
            $scope.gridOptions.api.setRowData(response.data);
            $scope.numResults = response.data.length;
        });
    };

    /*
        Calculate Graham number for a stock
    */
    function gramhamNumberCalculation(params) {

        if (!("defaultKeyStatistics" in params.data)) {
            return null;
        }
        if (!("bookValue" in params.data.defaultKeyStatistics) || !("trailingEps" in params.data.defaultKeyStatistics)) {
            return null
        }
        return Math.sqrt(15 * 1.5 * Number(params.data.defaultKeyStatistics.bookValue.raw) * Number(params.data.defaultKeyStatistics.trailingEps.raw)).toFixed(2);
    }

    /*
        Calculate trailing PE
    */
    function peRatioCalculation(params) {

        if (!("financialData" in params.data) || !("defaultKeyStatistics" in params.data)) {
            return null;
        }
        if (!("currentPrice" in params.data.financialData) || !("trailingEps" in params.data.defaultKeyStatistics)) {
            return null
        }

        var stockPrice = Number(params.data.financialData.currentPrice.raw);
        var trailingEps = Number(params.data.defaultKeyStatistics.trailingEps.raw);

        return Number((stockPrice / trailingEps).toFixed(2));
    }

    /*
        Highlights cells based on PB Ratio
    */
   function pbRatioCellRenderer (params) {

    if (params.value == null) {
        return String.Empty;
    }      
    var pbRatio = (params.value).toFixed(2);

    if (pbRatio < 1) {
        color = "green";
    } else if (pbRatio >= 1 && pbRatio <= 3) {
        color = "orange"; 
    } else if (pbRatio > 3) {
        color = "red";
    } 
        return '<span style="color: ' + color + '">' + pbRatio + '</span>';
    }

    /*
        Highlights cells based on Graham Number
    */
   function grahamNumberCellRenderer (params) {

        if (params.value == null) {
            return String.Empty;
        }
              
        var isUnderPriced = Number(params.value) > (params.data.financialData.currentPrice.raw);

        if (isUnderPriced) {
            color = "green";
        } else {
            color = "red";
        } 

        return '<span style="color: ' + color + '">' + params.value + '</span>';
    }

    /*
       Format percentage numbers
    */
   function percentCellRenderer(params) {
        if (params.value == null) {
            return null;
        }

        var value = params.value;

        if (params.conversionRequired) {
            value = value * 100;
        }

        var eDivPercentBar = document.createElement('div');
        eDivPercentBar.className = 'div-percent-bar';
        eDivPercentBar.style.width = value + '%';

        var eValue = document.createElement('div');
        eValue.className = 'div-percent-value';
        eValue.innerHTML = value.toFixed(2) + '%';

        var eOuterDiv = document.createElement('div');
        eOuterDiv.className = 'div-outer-div';
        eOuterDiv.appendChild(eDivPercentBar);
        eOuterDiv.appendChild(eValue);

        return eOuterDiv;
    }

    /*
        Highlights cells based on PE Ratio
    */
    function peRatioCellRenderer (params) {
     
        var peRatio = peRatioCalculation(params);

        if (peRatio == null) {
            return null;
        }

        if (peRatio > 0 && peRatio < 10) {
            color = "green";
        } else if (peRatio >= 10 && peRatio <= 20) {
            color = "orange"; 
        } else {
            color = "red";
        } 

        return '<span style="color: ' + color + '">' + peRatio + '</span>';
    }

    /*
        Bolds cells values in the grid
    */
    function boldCellRenderer(params) {

        var cellHtml = String.Empty;

        if (params.value != null ) {
            cellHtml =  "<b>" + params.value + "</b>"
        } 
        return cellHtml;
    }

}]);