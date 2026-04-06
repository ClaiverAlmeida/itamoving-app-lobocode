import React from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import {
  Truck,
  Save,
  X,
  ArrowLeft,
} from 'lucide-react';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

import type { DriverServiceOrderFormProps } from '../../api';
import {
  ServiceOrderFormBackOfficeCard,
  ServiceOrderFormCompanyInfoCard,
  ServiceOrderFormDriverObservationsCard,
  ServiceOrderFormImportantNoteCard,
  ServiceOrderFormPaymentCard,
  ServiceOrderFormProductsCard,
  ServiceOrderFormRecipientCard,
  ServiceOrderFormSenderCard,
  ServiceOrderFormSignaturesCards,
  useServiceOrderFormState,
  useServiceOrderFormSave,
  yearsCompanyInfo,
} from './service-order-form/index';
import {
  caixaTemTodosCamposPreenchidos,
  isFitaAdesiva,
} from './service-order-form/index';

export default function OrdemServicoForm({
  appointmentId,
  agendamento,
  onClose,
  onSave,
  onAgendamentosAtualizados,
  embedded = false,
  existingOrdem,
}: DriverServiceOrderFormProps) {
  const { user } = useAuth();
  const {
    isEditMode,
    canvasClienteRef,
    canvasAgenteRef,
    motoristas,
    produtosLoading,
    motoristasLoading,
    hydrationReady,
    opcoesCaixa,
    remetenteNome,
    setRemetenteNome,
    remetenteTel,
    setRemetenteTel,
    remetenteEndereco,
    setRemetenteEndereco,
    remetenteCidade,
    setRemetenteCidade,
    remetenteEstado,
    setRemetenteEstado,
    remetenteZipCode,
    setRemetenteZipCode,
    remetenteNumero,
    setRemetenteNumero,
    remetenteComplemento,
    setRemetenteComplemento,
    remetenteCpfRg,
    setRemetenteCpfRg,
    destinatarioNome,
    setDestinatarioNome,
    destinatarioCpfRg,
    setDestinatarioCpfRg,
    destinatarioEndereco,
    setDestinatarioEndereco,
    destinatarioBairro,
    setDestinatarioBairro,
    destinatarioCidade,
    setDestinatarioCidade,
    destinatarioEstado,
    setDestinatarioEstado,
    destinatarioCep,
    setDestinatarioCep,
    destinatarioTelefone,
    setDestinatarioTelefone,
    destinatarioNumero,
    setDestinatarioNumero,
    destinatarioComplemento,
    setDestinatarioComplemento,
    caixas,
    itens,
    assinaturaCliente,
    assinaturaAgente,
    cashUsd,
    setCashUsd,
    paymentPoolUsd,
    observations,
    setObservations,
    ordemStatus,
    setOrdemStatus,
    ordemObservacoes,
    setOrdemObservacoes,
    motoristaResponsavel,
    setMotoristaResponsavel,
    motoristaResponsavelNome,
    valorTotalCaixas,
    adicionarCaixa,
    atualizarCaixa,
    removerCaixa,
    adicionarItens,
    atualizarItem,
    removerItens,
    startDrawingCliente,
    drawCliente,
    stopDrawingCliente,
    limparAssinaturaCliente,
    startDrawingAgente,
    drawAgente,
    stopDrawingAgente,
    limparAssinaturaAgente,
    existingProductIdsRef,
    clienteAssinaturaDirtyRef,
    agenteAssinaturaDirtyRef,
  } = useServiceOrderFormState({ appointmentId, agendamento, existingOrdem, user });

  const { canSave, salvarOrdemServico } = useServiceOrderFormSave({
    isEditMode,
    appointmentId,
    existingOrdem,
    user,
    onClose,
    onSave,
    onAgendamentosAtualizados,
    hydrationReady,
    motoristasLoading,
    produtosLoading,
    motoristas,
    motoristaResponsavel,
    motoristaResponsavelNome,
    ordemStatus,
    ordemObservacoes,
    paymentPoolUsd,
    cashUsd,
    assinaturaCliente,
    assinaturaAgente,
    canvasClienteRef,
    canvasAgenteRef,
    clienteAssinaturaDirtyRef,
    agenteAssinaturaDirtyRef,
    remetenteNome,
    remetenteTel,
    remetenteCpfRg,
    remetenteEndereco,
    remetenteNumero,
    remetenteCidade,
    remetenteEstado,
    remetenteZipCode,
    remetenteComplemento,
    destinatarioNome,
    destinatarioCpfRg,
    destinatarioEndereco,
    destinatarioBairro,
    destinatarioCidade,
    destinatarioEstado,
    destinatarioCep,
    destinatarioTelefone,
    destinatarioNumero,
    destinatarioComplemento,
    observations,
    caixas,
    itens,
    opcoesCaixa,
    existingProductIds: existingProductIdsRef.current,
  });

  const FormContent = (
    <motion.div
      initial={embedded ? { opacity: 0 } : { scale: 0.95, y: 20 }}
      animate={embedded ? { opacity: 1 } : { scale: 1, y: 0 }}
      exit={embedded ? { opacity: 0 } : { scale: 0.95, y: 20 }}
      className={embedded ? "bg-white rounded-lg shadow-sm w-full min-w-0" : "bg-white rounded-lg shadow-2xl w-full max-w-5xl my-8 min-w-0"}
    >
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2A4A6F] text-white p-4 sm:p-6 rounded-t-lg flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          {embedded ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 mr-2 -ml-2"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
          ) : (
            <div className="p-3 bg-[#F5A623] rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
          )}

          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold truncate">ITAMOVING</h2>
            <p className="text-xs sm:text-sm text-white/80">
              {isEditMode
                ? `Editar ordem #${existingOrdem?.id} — Back-office`
                : 'Ordem de Serviço - Motorista'}
            </p>
          </div>
        </div>
        {!embedded && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Conteúdo */}
      <div className={`p-4 sm:p-6 space-y-6 min-w-0 ${!embedded ? "max-h-[calc(100vh-200px)] overflow-y-auto" : ""}`}>
        {/* Informações da Empresa */}
        <ServiceOrderFormCompanyInfoCard contactPhone={agendamento.company.contactPhone} years={yearsCompanyInfo()} />

        {isEditMode || user?.role !== 'motorista' ? (
          <ServiceOrderFormBackOfficeCard
            isEditMode={isEditMode}
            existingOrdem={existingOrdem}
            ordemStatus={ordemStatus}
            setOrdemStatus={setOrdemStatus}
            motoristas={motoristas}
            motoristaResponsavel={motoristaResponsavel}
            setMotoristaResponsavel={setMotoristaResponsavel}
            isMotoristaUser={user?.role === 'motorista'}
            ordemObservacoes={ordemObservacoes}
            setOrdemObservacoes={setOrdemObservacoes}
            observations={observations}
            setObservations={setObservations}
          />
        ) : null}

        <ServiceOrderFormSenderCard
          remetenteNome={remetenteNome}
          setRemetenteNome={setRemetenteNome}
          remetenteCpfRg={remetenteCpfRg}
          setRemetenteCpfRg={setRemetenteCpfRg}
          remetenteTel={remetenteTel}
          setRemetenteTel={setRemetenteTel}
          remetenteEndereco={remetenteEndereco}
          setRemetenteEndereco={setRemetenteEndereco}
          remetenteNumero={remetenteNumero}
          setRemetenteNumero={setRemetenteNumero}
          remetenteComplemento={remetenteComplemento}
          setRemetenteComplemento={setRemetenteComplemento}
          remetenteCidade={remetenteCidade}
          setRemetenteCidade={setRemetenteCidade}
          remetenteEstado={remetenteEstado}
          setRemetenteEstado={setRemetenteEstado}
          remetenteZipCode={remetenteZipCode}
          setRemetenteZipCode={setRemetenteZipCode}
        />

        <ServiceOrderFormRecipientCard
          destinatarioNome={destinatarioNome}
          setDestinatarioNome={setDestinatarioNome}
          destinatarioCpfRg={destinatarioCpfRg}
          setDestinatarioCpfRg={setDestinatarioCpfRg}
          destinatarioTelefone={destinatarioTelefone}
          setDestinatarioTelefone={setDestinatarioTelefone}
          destinatarioEndereco={destinatarioEndereco}
          setDestinatarioEndereco={setDestinatarioEndereco}
          destinatarioBairro={destinatarioBairro}
          setDestinatarioBairro={setDestinatarioBairro}
          destinatarioNumero={destinatarioNumero}
          setDestinatarioNumero={setDestinatarioNumero}
          destinatarioComplemento={destinatarioComplemento}
          setDestinatarioComplemento={setDestinatarioComplemento}
          destinatarioCidade={destinatarioCidade}
          setDestinatarioCidade={setDestinatarioCidade}
          destinatarioEstado={destinatarioEstado}
          setDestinatarioEstado={setDestinatarioEstado}
          destinatarioCep={destinatarioCep}
          setDestinatarioCep={setDestinatarioCep}
        />

        {/* Seção Produtos e Valores */}
        <ServiceOrderFormProductsCard
          caixas={caixas}
          itens={itens}
          opcoesCaixa={opcoesCaixa}
          valorTotalCaixas={valorTotalCaixas}
          adicionarCaixa={adicionarCaixa}
          atualizarCaixa={atualizarCaixa}
          removerCaixa={removerCaixa}
          adicionarItens={adicionarItens}
          atualizarItem={atualizarItem}
          removerItens={removerItens}
          caixaTemTodosCamposPreenchidos={caixaTemTodosCamposPreenchidos}
          isFitaAdesiva={isFitaAdesiva}
        />

        {/* Seção Assinaturas */}
        <ServiceOrderFormSignaturesCards
          canvasClienteRef={canvasClienteRef}
          canvasAgenteRef={canvasAgenteRef}
          startDrawingCliente={startDrawingCliente}
          drawCliente={drawCliente}
          stopDrawingCliente={stopDrawingCliente}
          limparAssinaturaCliente={limparAssinaturaCliente}
          startDrawingAgente={startDrawingAgente}
          drawAgente={drawAgente}
          stopDrawingAgente={stopDrawingAgente}
          limparAssinaturaAgente={limparAssinaturaAgente}
        />

        {/* Seção Pagamento em Espécie */}
        <ServiceOrderFormPaymentCard
          valorTotalCaixas={valorTotalCaixas}
          valorAgendamento={Number(agendamento?.value ?? 0)}
          valorAntecipacao={Number(agendamento?.downPayment ?? 0)}
          paymentPoolUsd={paymentPoolUsd}
          cashUsd={cashUsd}
          setCashUsd={setCashUsd}
        />

        {/* Observações (somente criação pelo próprio motorista; admin usa o card de gestão) */}
        {!isEditMode && user?.role === 'motorista' && (
          <>
            <ServiceOrderFormDriverObservationsCard
              observations={observations}
              setObservations={setObservations}
            />
          </>
        )}

        {/* Nota Importante */}
        <ServiceOrderFormImportantNoteCard />
      </div>

      {/* Rodapé com Botões */}
      <div className="p-4 sm:p-6 border-t bg-gray-50 rounded-b-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-muted-foreground w-full sm:w-auto">
          <p>Data: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
          <p>
            Agente:{' '}
            {isEditMode
              ? motoristaResponsavelNome || existingOrdem?.driverName || user?.nome || 'Motorista'
              : user?.role === 'motorista'
                ? user?.nome || 'Motorista'
                : motoristaResponsavelNome || '—'}
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto gap-2 sm:gap-3">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button
            onClick={salvarOrdemServico}
            disabled={isEditMode ? !canSave : false}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEditMode ? 'Salvar alterações' : 'Salvar Ordem de Serviço'}
          </Button>
        </div>
      </div>
    </motion.div >
  );

  if (embedded) {
    return FormContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-6"
    >
      {FormContent}
    </motion.div>
  );
}