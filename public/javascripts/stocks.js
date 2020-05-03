var app = angular.module('stocksApp', ["agGrid"]);

agGrid.initialiseAgGridWithAngular1(angular);

app.factory('stocks', ['$http',function($http){

  var getStocks = function() {
    return $http({
      method: 'GET',
      url: 'api/stocks'
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
            ]
        },
        {
            headerName: 'Key Statistics',
            children: [
                { headerName: "P/E Ratio", field: "peRatio", filter: 'agNumberColumnFilter', width: 150, cellRenderer: peRatioCellRenderer}, 
                { headerName: "P/B Ratio", field: "defaultKeyStatistics.priceToBook.raw", filter: 'agNumberColumnFilter', width: 200, cellRenderer: pbRatioCellRenderer}, 
            ]
        },
        {
            headerName: 'Statistics',
            children: [
                { headerName: "Industry", field: "summaryProfile.industry", filter: 'agTextColumnFilter', width: 150},
                { headerName: "Date", field: "_id", width: 150, filter: 'agDateColumnFilter', valueFormatter: mongoObjectIdDateFormatter}, //TODO: Date filter doesnt work
                { headerName: "Market Cap", field: "price.marketCap.fmt", filter: 'agTextColumnFilter', width: 150},
                { headerName: "Asset Type", field: "quoteType.quoteType", filter: 'agTextColumnFilter', width: 150},
                { headerName: "Price", field: "price.regularMarketPrice.raw", filter: 'agNumberColumnFilter', width: 150, cellRenderer: boldCellRenderer},
                { headerName: "Trailing EPS", field: "defaultKeyStatistics.trailingEps.raw", filter: 'agNumberColumnFilter', width: 150},
                { headerName: "Forward EPS", field: "defaultKeyStatistics.forwardEps.raw", filter: 'agNumberColumnFilter', width: 150}
            ]
        }
    ];

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
    stocks.getStocks().then(function(response) {
        console.log("Done querying for data");
        $scope.gridOptions.api.setRowData(response.data);
    });

    /*
        Convert MongoDB ObjectId to Date value
    */
    function mongoObjectIdDateFormatter(params) {
        return (new Date(parseInt(params.value.slice(0,8), 16)*1000)).toDateString();
    }

    //TODO: Need to be able to filter this in the UI
    function peRatioCalculation(params) {

        if (!params.data.price.hasOwnProperty("regularMarketPrice") || !params.data.defaultKeyStatistics.hasOwnProperty("trailingEps")) {
            return null;
        }

        var stockPrice = Number(params.data.price.regularMarketPrice.raw);
        var trailingEps = Number(params.data.defaultKeyStatistics.trailingEps.raw);

        return (stockPrice / trailingEps).toFixed(2);
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
        Highlights cells based on PE Ratio
    */
    function peRatioCellRenderer (params) {
     
        var peRatio = peRatioCalculation(params);

        if (peRatio == null) {
            return String.Empty;
        }

        if (peRatio < 10) {
            color = "green";
        } else if (peRatio >= 10 && peRatio <= 20) {
            color = "orange"; 
        } else if (peRatio > 20) {
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