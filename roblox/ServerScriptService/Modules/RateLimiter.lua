local RateLimiter = {}

local records = {}

function RateLimiter:CanRequest(player, cooldown)
	if not player then
		return false
	end

	local now = os.clock()
	local previous = records[player]

	if previous and now - previous < cooldown then
		return false
	end

	records[player] = now

	return true
end

function RateLimiter:Reset(player)
	if player then
		records[player] = nil
	end
end

return RateLimiter