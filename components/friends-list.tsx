"use client";

import { useEffect, useState } from "react";
import { UserPlus, Check, X, Clock, Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";

type Friend = {
	id: string;
	friend: {
		id: string;
		name: string;
		imageUrl: string;
		email: string;
		isNitro?: boolean;
		nitroPlan?: 'FLUX' | 'NEBULA' | 'QUANTUM';
	};
	status: string;
	createdAt: string;
	updatedAt: string;
};

type Request = {
	id: string;
	friend: {
		id: string;
		name: string;
		imageUrl: string;
		email: string;
		isNitro?: boolean;
		nitroPlan?: 'FLUX' | 'NEBULA' | 'QUANTUM';
	};
	status: string;
	isReceived: boolean;
	createdAt: string;
	updatedAt: string;
};

type FriendsData = {
	friends: Friend[];
	requests: Request[];
	totalFriends: number;
	pendingRequests: number;
	sentRequests: number;
};

export const FriendsList = () => {
	const [friendsData, setFriendsData] = useState<FriendsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [processingRequest, setProcessingRequest] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(true);
	const { onOpen } = useModal();

	const fetchFriends = async () => {
		try {
			const response = await fetch('/api/friends');
			if (response.ok) {
				const data = await response.json();
				setFriendsData(data);
			}
		} catch (error) {
			console.error('Erro ao buscar amigos:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchFriends();
	}, []);

	const handleRequestAction = async (requestId: string, action: 'accept' | 'decline') => {
		setProcessingRequest(requestId);
		try {
			const response = await fetch('/api/friends', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ requestId, action })
			});

			if (response.ok) {
				await fetchFriends();
			} else {
				const error = await response.text();
				alert(`Erro: ${error}`);
			}
		} catch (error) {
			console.error('Erro ao processar solicitação:', error);
			alert('Erro ao processar solicitação');
		} finally {
			setProcessingRequest(null);
		}
	};

	const getDisplayName = (name: string) => {
		return name.replace(/^@/, '');
	};

	const getNitroColor = (nitroPlan?: string) => {
		switch (nitroPlan) {
			case 'FLUX': return 'text-yellow-400';
			case 'NEBULA': return 'text-blue-400';
			case 'QUANTUM': return 'text-fuchsia-400';
			default: return 'text-zinc-300';
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-32">
				<div className="text-zinc-400">Carregando amigos...</div>
			</div>
		);
	}

	if (!friendsData) {
		return (
			<div className="flex items-center justify-center h-32">
				<div className="text-zinc-400">Erro ao carregar amigos</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg mx-1">
				<button
					type="button"
					onClick={() => setIsOpen((v) => !v)}
					className="flex items-center space-x-2 group flex-1 min-w-0"
				>
					<ChevronDown className={cn("h-5 w-5 text-zinc-400 transition-transform", isOpen ? "rotate-0" : "-rotate-90")}/>
					<div className="flex items-center space-x-2 min-w-0">
						<Users className="h-5 w-5 text-zinc-400" />
						<span className="text-zinc-300 font-medium">Amigos ({friendsData.totalFriends})</span>
					</div>
					{friendsData.pendingRequests > 0 && (
						<span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-600 whitespace-nowrap shrink-0">
							<Clock className="h-3 w-3" />
							{friendsData.pendingRequests} pendente{friendsData.pendingRequests > 1 ? 's' : ''}
						</span>
					)}
				</button>
				<div className="flex items-center space-x-2 shrink-0">
					<Button
						size="sm"
						onClick={() => onOpen("addFriend")}
						className="h-8 px-3 bg-green-600 hover:bg-green-700"
					>
						<UserPlus className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{isOpen && (
				<div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
					{friendsData.requests.filter(r => r.isReceived).length > 0 && (
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-zinc-400 px-2">Solicitações Recebidas</h3>
							{friendsData.requests
								.filter(request => request.isReceived)
								.map((request) => (
									<div key={request.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg w-full mx-1">
										<div className="flex items-center space-x-3 min-w-0">
											<UserAvatar 
												src={request.friend.imageUrl} 
												alt={request.friend.name}
												allowGif={request.friend.isNitro}
											/>
											<div className="min-w-0">
												<div className="flex items-center space-x-2">
													<span className={cn("font-medium break-words", getNitroColor(request.friend.nitroPlan))}>
														{getDisplayName(request.friend.name)}
													</span>
													{request.friend.nitroPlan && (
														<span className="text-xs px-2 py-1 bg-zinc-700 rounded-full">NITRO</span>
													)}
												</div>
												<span className="text-xs text-zinc-500 block">quer ser seu amigo</span>
											</div>
										</div>
										<div className="flex items-center space-x-2 shrink-0">
											<Button
												size="sm"
												onClick={() => handleRequestAction(request.id, 'accept')}
												disabled={processingRequest === request.id}
												className="h-8 px-3 bg-green-600 hover:bg-green-700"
											>
												<Check className="h-4 w-4" />
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleRequestAction(request.id, 'decline')}
												disabled={processingRequest === request.id}
												className="h-8 px-3 border-zinc-600 hover:bg-zinc-700"
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
						</div>
					)}

					{friendsData.requests.filter(r => !r.isReceived).length > 0 && (
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-zinc-400 px-2">Solicitações Enviadas</h3>
							{friendsData.requests
								.filter(request => !request.isReceived)
								.map((request) => (
									<div key={request.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg w-full mx-1">
										<div className="flex items-center space-x-3 min-w-0">
											<UserAvatar 
												src={request.friend.imageUrl} 
												alt={request.friend.name}
												allowGif={request.friend.isNitro}
											/>
											<div className="min-w-0">
												<div className="flex items-center space-x-2">
													<span className={cn("font-medium break-words", getNitroColor(request.friend.nitroPlan))}>
														{getDisplayName(request.friend.name)}
													</span>
													{request.friend.nitroPlan && (
														<span className="text-xs px-2 py-1 bg-zinc-700 rounded-full">NITRO</span>
													)}
												</div>
												<span className="text-xs text-zinc-500 block">aguardando resposta</span>
											</div>
										</div>
										<div className="flex items-center space-x-1 text-zinc-500 shrink-0">
											<Clock className="h-4 w-4" />
										</div>
									</div>
								))}
						</div>
					)}

					{friendsData.friends.length > 0 ? (
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-zinc-400 px-2">Seus Amigos</h3>
							{friendsData.friends.map((friend) => (
								<div key={friend.id} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-colors w-full mx-1">
									<div className="flex items-center space-x-3 min-w-0">
										<UserAvatar 
											src={friend.friend.imageUrl} 
											alt={friend.friend.name}
											allowGif={friend.friend.isNitro}
										/>
										<div className="min-w-0">
											<div className="flex items-center space-x-2">
												<span className={cn("font-medium break-words", getNitroColor(friend.friend.nitroPlan))}>
													{getDisplayName(friend.friend.name)}
												</span>
												{friend.friend.nitroPlan && (
													<span className="text-xs px-2 py-1 bg-zinc-700 rounded-full">NITRO</span>
												)}
											</div>
											<span className="text-xs text-zinc-500 block">amigo desde {new Date(friend.createdAt).toLocaleDateString("pt-BR")}</span>
										</div>
									</div>
									<Button
										size="sm"
										variant="ghost"
										onClick={() => onOpen("userProfile", { 
											profile: {
												...friend.friend,
												userId: friend.friend.id,
												bannerUrl: null,
												bio: null,
												isNitro: friend.friend.isNitro || false,
												nitroExpiresAt: null,
												customNickname: null,
												nitroPlan: friend.friend.nitroPlan || null,
												createdAt: new Date(),
												updatedAt: new Date()
											}
										})}
										className="h-8 px-3 text-zinc-400 hover:text-zinc-300 shrink-0"
									>
										Ver perfil
									</Button>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<Users className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
							<p className="text-zinc-400 mb-2">Você ainda não tem amigos</p>
							<p className="text-zinc-500 text-sm">Adicione amigos clicando em &quot;Adicionar Amigo&quot; nos perfis dos usuários</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
