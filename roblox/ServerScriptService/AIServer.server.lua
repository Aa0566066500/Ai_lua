local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(
	ReplicatedStorage:WaitForChild("AIConfig")
)

local remote = ReplicatedStorage:FindFirstChild(
	Config.RemoteName
)

if not remote then
	remote = Instance.new("RemoteEvent")
	remote.Name = Config.RemoteName
	remote.Parent = ReplicatedStorage
end

local lastRequest = {}

local function isValidMessage(message)
	if typeof(message) ~= "string" then
		return false
	end

	if #message < 1 then
		return false
	end

	if #message > Config.MaxMessageLength then
		return false
	end

	return true
end

local function canRequest(player)
	local currentTime = os.clock()
	local previousTime = lastRequest[player]

	if previousTime then
		if currentTime - previousTime < Config.RequestCooldown then
			return false
		end
	end

	lastRequest[player] = currentTime

	return true
end

remote.OnServerEvent:Connect(function(player, message)

	if not player then
		return
	end

	if not isValidMessage(message) then
		remote:FireClient(player, {
			Type = "Error",
			Message = "Invalid message."
		})

		return
	end

	if not canRequest(player) then
		remote:FireClient(player, {
			Type = "Error",
			Message = "Please wait before sending another request."
		})

		return
	end

	-- سيتم هنا لاحقًا إرسال الطلب إلى Backend.
	-- لا تضع API Key داخل Roblox.

	remote:FireClient(player, {
		Type = "Response",
		Message = "Request received by the Roblox server."
	})
end)

Players.PlayerRemoving:Connect(function(player)
	lastRequest[player] = nil
end)