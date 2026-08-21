local RequestManager = {}

local lastRequest = 0
local requestInProgress = false

function RequestManager:IsBusy()
	return requestInProgress
end

function RequestManager:CanRequest(cooldown)
	if requestInProgress then
		return false
	end

	local now = os.clock()

	if now - lastRequest < cooldown then
		return false
	end

	return true
end

function RequestManager:Start()
	requestInProgress = true
	lastRequest = os.clock()
end

function RequestManager:Finish()
	requestInProgress = false
end

function RequestManager:Reset()
	requestInProgress = false
	lastRequest = 0
end

return RequestManager