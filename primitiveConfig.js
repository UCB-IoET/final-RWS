//highest level is category, second level is actual node type
{
	'static' : { 
		'number' : { 
			'value',
			'outputs' : ['outputVal']
		}
		'string' : {
			'value',
			'outputs' : ['outputVal']
		}
	}

	'call' : {
		'print' : {
			'inputs' : ['value']
		}
	},

	'conditional' : {
		'>=' : {
			'inputs' : ['threshold', 'value'],
			'outputs' : ['result']
		}, 
		'<=' : {
			'inputs' : ['threshold', 'value'],
			'outputs' : ['result']
		}, 
		'if' : {
			'inputs' : ['value'],
			'outputs' : ['true', 'false']
		}
	},

	'math' : {
		'round' : {
			'inputs' : ['value'],
			'outputs' : ['result']
		},
		'binary' : {
			'inputs' : ['value'],
			'outputs' : ['result']
		}
	}
};