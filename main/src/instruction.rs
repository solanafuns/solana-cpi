use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    instruction::{AccountMeta, Instruction},
    msg,
    program::invoke,
    pubkey::Pubkey,
    system_instruction,
};

solana_program::entrypoint!(process_instruction);

// program entrypoint's implementation
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("Hello CPI world, I'm main module, I'll call module!");

    let account_info_iter = &mut accounts.iter();
    let payer = next_account_info(account_info_iter)?;
    let module_program = next_account_info(account_info_iter)?;
    let one_user = next_account_info(account_info_iter)?;

    msg!("transfer to payer himself");

    // 构造SystemInstruction::Transfer
    let transfer_instruction = system_instruction::transfer(
        payer.key, payer.key, 3000, // lamports数量
    );

    invoke(&transfer_instruction, &[payer.clone(), payer.clone()])?;

    msg!("invoke module program");

    let instruction = Instruction {
        program_id: *module_program.key,
        accounts: vec![AccountMeta::new(*one_user.key, false)],
        data: vec![],
    };

    invoke(
        &instruction,
        &vec![payer.clone(), module_program.clone(), one_user.clone()],
    )?;

    // gracefully exit the program
    Ok(())
}
