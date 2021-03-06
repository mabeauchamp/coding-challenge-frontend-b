import React, { Component } from 'react';
import SearchBarComponent from './SearchBarComponent';
import SearchResultsComponent from './SearchResultsComponent';
import './css/uikit.min.css';
import './App.css';
import axios from 'axios';
import busbudLogo from './busbud_logo.svg'
import headerImage from './HEADER.png'

class App extends Component {

	constructor(props){
		super(props);

		this.state = {
			origin: "New York",
			destination: "Montreal",
			date: new Date(2018,9,2),
			adults: 1,
			expiration: Date.now(),
			loading : false,
			departures : []
		}

	}

	searchHandler(event) {
		//curl - H "Accept: application/vnd.busbud+json; version=2; profile=https://schema.busbud.com/v2/" - H "X-Busbud-Token:PARTNER_JSWsVZQcS_KzxNRzGtIt1A" https: //napi.busbud.com/x-departures/dr5reg/f25dvk/2018-02-07\?adult\=1
		
		if(this.state.expiration <= Date.now() || this.state.loading || this.state.departures.length===0){
			this.getData();
			this.setState({loading:true});

			var poll = setInterval(function(){
				if(this.state.loading || this.state.departures.length===0){
					this.getData(); 
				}else{
					clearInterval(poll);
				}
			}.bind(this),2000)
		}
	}

	getData() {
		axios({
			url: 'https://napi.busbud.com/x-departures/dr5reg/f25dvk/2018-02-07',
			method: 'get',
			data: {
				adult: 1
			},
			headers: {
				'Accept': 'application/vnd.busbud+json; version=2; profile=https://schema.busbud.com/v2/',
				'X-Busbud-Token': 'PARTNER_JSWsVZQcS_KzxNRzGtIt1A'
			}
		})
		.catch(function (error) {
			console.log(error);
		})
		.then(function (response) {
			if(response.status === 200 && response.data.is_valid_route === true){
				if(response.data.complete === true){
					this.setState({loading:false, expiration : new Date(Date.now() + (response.data.ttl*1000))});
					this.filterData(response.data);

				}
			}
		}.bind(this));
	}

	filterData(data){
		var results = [];
		for(var departure of data.departures){
			var departureDate = new Date(departure.departure_time);
			var arrivalDate = new Date(departure.arrival_time);
			results.push({
				id: departure.id,
				departureTime: ('0'+departureDate.getHours()).substr(-2)+':'+('0'+departureDate.getMinutes()).substr(-2),
				arrivalTime: ('0'+arrivalDate.getHours()).substr(-2)+':'+('0'+arrivalDate.getMinutes()).substr(-2),
				originLocation: data.locations.find((location) => location.id === departure.origin_location_id).name,
				destinationLocation: data.locations.find((location) => location.id === departure.destination_location_id).name,
				operatorImage: data.operators.find((operator) => operator.id === departure.operator_id).logo_url,
				operatorName: data.operators.find((operator) => operator.id === departure.operator_id).name,
				price: departure.prices.total/100,
				currency: departure.prices.currency
			})
		}

		this.setState({departures: results});
	}

	render() {
		var headerStyles = {
			backgroundImage:'url('+headerImage+')'
		};

		return (
			<div className="App">
				<div className="App-header">
					<div className="splash" style={headerStyles}/>
					<div className="Form-container uk-width-1-1">
						<img src={busbudLogo} className="Busbud-logo" alt="Busbud"/>
							
						<SearchBarComponent 
							origin={this.state.origin}
							destination={this.state.destination}
							date={this.state.date}
							adults={this.state.adults}
							searchHandler={this.searchHandler.bind(this)}
							loading={this.state.loading}
						/>
					</div>
				</div>
				<div className="spacer"></div>
				<SearchResultsComponent 
					departures={this.state.departures}
				/>
			</div>
		);
	}
}

export default App;
